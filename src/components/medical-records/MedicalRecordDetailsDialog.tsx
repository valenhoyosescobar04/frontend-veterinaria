import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    User,
    Activity,
    Thermometer,
    HeartPulse,
    Pill,
    ClipboardList,
    AlertCircle,
    Edit,
    Trash2,
    Stethoscope,
    Weight,
    Clock,
    FileText,
    Download,
    Printer
} from 'lucide-react';
import type { MedicalRecord } from '@/types/medicalRecord';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// @ts-ignore - html2pdf.js no tiene tipos TypeScript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { medicalRecordPDFTemplate, renderMedicalRecordTemplate } from '@/templates/medical-record-pdf-template';
import { medicalRecordService } from '@/services/medicalRecordService';
import { useState, useEffect } from 'react';

interface MedicalRecordDetailsDialogProps {
    record: MedicalRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function MedicalRecordDetailsDialog({
    record,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: MedicalRecordDetailsDialogProps) {
    const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    useEffect(() => {
        if (open && record.patientId) {
            loadPatientRecords();
        }
    }, [open, record.patientId]);

    const loadPatientRecords = async () => {
        try {
            setLoadingRecords(true);
            const records = await medicalRecordService.getByPatientId(record.patientId.toString());
            setPatientRecords(records || []);
        } catch (error) {
            console.error('Error al cargar historias clínicas del paciente:', error);
        } finally {
            setLoadingRecords(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    };

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), "HH:mm");
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Genera HTML completo con DOCTYPE para impresión (usa el template centralizado)
    const generatePDFFullHTML = () => {
        const bodyContent = generatePDFHTML();
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica - ${record.patientName}</title>
    <style>
        @media print {
            @page { margin: 2cm; }
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
            background: white;
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
    };

    const generatePDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = generatePDFFullHTML();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        return printWindow;
    };

    const handlePrint = () => {
        const printWindow = generatePDF();
        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };
        }
    };

    // Función centralizada para generar y descargar PDF desde HTML
    const downloadPDFFromHTML = async (htmlContent: string, filename: string) => {
        let container: HTMLDivElement | null = null;
        try {
            // Crear un contenedor temporal
            container = document.createElement('div');
            container.innerHTML = htmlContent;
            
            // Ancho A4 en píxeles: 210mm = 794px a 96 DPI
            const A4_WIDTH_PX = 794;
            
            // Estilos para hacer el contenedor visible pero fuera de la vista
            Object.assign(container.style, {
                position: 'fixed',
                left: '0',
                top: '0',
                width: `${A4_WIDTH_PX}px`,
                maxWidth: `${A4_WIDTH_PX}px`,
                backgroundColor: 'white',
                padding: '0',
                margin: '0',
                zIndex: '99999',
                transform: 'translateX(-100%)',
                visibility: 'visible',
                opacity: '1',
                overflow: 'visible',
                boxSizing: 'border-box'
            });
            
            document.body.appendChild(container);

            // Esperar a que las imágenes se carguen completamente
            const images = container.querySelectorAll('img');
            const imagePromises = Array.from(images).map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continuar aunque falle la imagen
                    setTimeout(() => resolve(), 3000); // Timeout de 3 segundos
                });
            });
            
            await Promise.all(imagePromises);

            // Esperar a que el contenido se renderice completamente
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Forzar reflow y layout
                        void container?.offsetHeight;
                        void container?.scrollHeight;
                        setTimeout(resolve, 800); // Más tiempo para asegurar renderizado
                    });
                });
            });

            if (!container) {
                throw new Error('Contenedor no disponible');
            }

            // Usar html2canvas para capturar el contenido con mejor calidad
            const canvas = await html2canvas(container, {
                scale: 2, // Mayor resolución
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                width: A4_WIDTH_PX,
                height: container.scrollHeight,
                windowWidth: A4_WIDTH_PX,
                windowHeight: container.scrollHeight,
                onclone: (clonedDoc) => {
                    // Asegurar que los estilos se apliquen en el documento clonado
                    const clonedContainer = clonedDoc.querySelector('div');
                    if (clonedContainer) {
                        clonedContainer.style.width = `${A4_WIDTH_PX}px`;
                        clonedContainer.style.maxWidth = `${A4_WIDTH_PX}px`;
                    }
                }
            });

            // Verificar que el canvas tenga contenido
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('El canvas está vacío');
            }

            // Crear PDF con jsPDF
            const imgWidth = 210; // Ancho A4 en mm
            const pageHeight = 297; // Alto A4 en mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            let heightLeft = imgHeight;
            let position = 0;
            const imgData = canvas.toDataURL('image/jpeg', 0.95); // Buena calidad

            // Agregar la primera página
            if (heightLeft <= pageHeight) {
                // Contenido cabe en una página
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            } else {
                // Contenido requiere múltiples páginas
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                // Agregar páginas adicionales si es necesario
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            }

            // Descargar el PDF
            pdf.save(filename);

        } catch (error) {
            console.error('Error al generar PDF:', error);
            throw error;
        } finally {
            // Limpiar el contenedor temporal siempre
            if (container && document.body.contains(container)) {
                setTimeout(() => {
                    document.body.removeChild(container!);
                }, 500);
            }
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const htmlContent = generatePDFHTML();
            const filename = `Historia_Clinica_${record.patientName.replace(/\s+/g, '_')}_${record.id}_${format(new Date(), 'yyyyMMdd_HHmmss', { locale: es })}.pdf`;
            
            await downloadPDFFromHTML(htmlContent, filename);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            // Fallback: usar el método de impresión
            handlePrint();
        }
    };

    const generatePDFHTML = () => {
        // Usar URL directa de Imgur para el logo (mejor compatibilidad)
        const logoUrl = 'https://i.imgur.com/y9qQYK4.png';
        
        // Validar y formatear signos vitales
        const formatWeight = () => {
            if (record.weight !== null && record.weight !== undefined && record.weight > 0) {
                return `${record.weight} kg`;
            }
            return 'No registrado';
        };
        
        const formatTemperature = () => {
            if (record.temperature !== null && record.temperature !== undefined && record.temperature > 0) {
                return `${record.temperature}°C`;
            }
            return 'No registrado';
        };
        
        const formatHeartRate = () => {
            if (record.heartRate !== null && record.heartRate !== undefined && record.heartRate > 0) {
                return `${record.heartRate} bpm`;
            }
            return 'No registrado';
        };
        
        // Debug: Log de valores para verificar
        console.log('📊 Signos Vitales - Record:', {
            weight: record.weight,
            temperature: record.temperature,
            heartRate: record.heartRate,
            formattedWeight: formatWeight(),
            formattedTemperature: formatTemperature(),
            formattedHeartRate: formatHeartRate()
        });
        
        // Preparar los datos para el template
        const templateData = {
            logoUrl: logoUrl,
            patientName: record.patientName,
            id: record.id.toString(),
            recordDate: formatDate(record.recordDate),
            recordTime: formatTime(record.recordDate),
            followUpBadge: record.followUpRequired 
                ? '<div style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%); color: white; padding: 10px 20px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);"><span style="font-size: 16px;">⚠️</span> SEGUIMIENTO REQUERIDO</div>' 
                : '',
            weight: formatWeight(),
            temperature: formatTemperature(),
            heartRate: formatHeartRate(),
            symptomsSection: record.symptoms 
                ? `<div style="padding: 0 45px 35px 45px; background: #ffffff;">
                    <div style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(245, 158, 11, 0.1); border-left: 5px solid #f59e0b;">
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 20px 28px; color: white; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🩺</div>
                            <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.3px;">
                                Síntomas Reportados
                            </h2>
                        </div>
                        <div style="padding: 28px; line-height: 1.8; font-size: 14px; color: #1e293b; background: white; min-height: 60px;">
                            ${record.symptoms}
                        </div>
                    </div>
                   </div>`
                : '',
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            notesSection: record.notes 
                ? `<div style="padding: 0 45px 35px 45px; background: #ffffff;">
                    <div style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(99, 102, 241, 0.1); border-left: 5px solid #6366f1;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px 28px; color: white; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">📝</div>
                            <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.3px;">
                                Notas Clínicas
                            </h2>
                        </div>
                        <div style="padding: 28px; line-height: 1.8; font-size: 14px; color: #1e293b; font-style: italic; background: white; min-height: 60px;">
                            ${record.notes}
                        </div>
                    </div>
                   </div>`
                : '',
            veterinarianName: record.veterinarianName,
            followUpDateSection: record.followUpDate 
                ? `<div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: right;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin-bottom: 10px; font-weight: 600;">Próxima Visita</div>
                    <div style="font-size: 18px; font-weight: 700; color: #fbbf24; display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                        <span style="font-size: 20px;">📅</span> ${formatDate(record.followUpDate)}
                    </div>
                   </div>` 
                : '',
            generatedDate: format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })
        };

        // Renderizar el template con los datos
        return renderMedicalRecordTemplate(medicalRecordPDFTemplate, templateData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden h-[85vh] flex flex-col gap-0">

                {/* --- HEADER --- */}
                <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {getInitials(record.patientName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{record.patientName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-white text-slate-600 font-normal">
                                    Consulta #{record.id}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {formatDate(record.recordDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {record.followUpRequired && (
                        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            SEGUIMIENTO REQUERIDO
                        </div>
                    )}
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* --- SIDEBAR (SIGNOS VITALES) --- */}
                    <div className="w-64 bg-slate-50/50 border-r p-5 overflow-y-auto hidden md:block shrink-0">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Signos Vitales</h3>
                        <div className="space-y-3">
                            <VitalCard
                                icon={<Weight className="w-4 h-4 text-blue-500" />}
                                label="Peso"
                                value={record.weight ? `${record.weight} kg` : '--'}
                            />
                            <VitalCard
                                icon={<Thermometer className="w-4 h-4 text-red-500" />}
                                label="Temperatura"
                                value={record.temperature ? `${record.temperature}°C` : '--'}
                            />
                            <VitalCard
                                icon={<HeartPulse className="w-4 h-4 text-emerald-500" />}
                                label="Frec. Cardíaca"
                                value={record.heartRate ? `${record.heartRate} bpm` : '--'}
                            />
                        </div>

                        <Separator className="my-6" />

                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Metadatos</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Especialista</p>
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {record.veterinarianName ? `Dr. ${record.veterinarianName.split(' ')[0]}` : 'No asignado'}
                                    </span>
                                </div>
                            </div>
                            {record.followUpDate && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Próxima Visita</p>
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-sm font-bold">{formatDate(record.followUpDate)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- MAIN CONTENT (HISTORIA) --- */}
                    <ScrollArea className="flex-1 p-6 md:p-8">
                        <div className="max-w-2xl mx-auto space-y-8 pb-10">

                            {/* Sección Síntomas */}
                            {record.symptoms && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">Síntomas Reportados</h3>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 leading-relaxed text-sm">
                                        {record.symptoms}
                                    </div>
                                </section>
                            )}

                            {/* Sección Diagnóstico */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">Diagnóstico Médico</h3>
                                </div>
                                <div className="bg-white border rounded-xl p-5 shadow-sm text-slate-800 font-medium leading-relaxed">
                                    {record.diagnosis}
                                </div>
                            </section>

                            {/* Sección Tratamiento */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                                        <Pill className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">Plan de Tratamiento</h3>
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-5 text-emerald-900 leading-relaxed shadow-sm">
                                    {record.treatment}
                                </div>
                            </section>

                            {/* Notas Adicionales */}
                            {record.notes && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">Notas Clínicas</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic pl-2 border-l-2 border-slate-200">
                                        "{record.notes}"
                                    </p>
                                </section>
                            )}

                            {/* Historial de Historias Clínicas del Paciente */}
                            {patientRecords.length > 1 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">Historial de Historias Clínicas</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {loadingRecords ? (
                                            <p className="text-sm text-muted-foreground">Cargando...</p>
                                        ) : (
                                            patientRecords
                                                .filter(r => r.id !== record.id)
                                                .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
                                                .map((r) => (
                                                    <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-slate-100 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">
                                                                    Historia Clínica #{r.id}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDate(r.recordDate)} - {format(new Date(r.recordDate), "HH:mm", { locale: es })}
                                                                </p>
                                                                {r.diagnosis && (
                                                                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                                                                        {r.diagnosis}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </section>
                            )}

                        </div>
                    </ScrollArea>
                </div>

                {/* --- FOOTER --- */}
                <div className="border-t p-4 bg-white flex justify-between items-center shrink-0">
                    <div className="text-xs text-muted-foreground hidden sm:block">
                        Reg: {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm")}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <Button onClick={handlePrint} variant="outline" className="border-slate-300">
                            <Printer className="h-4 w-4 mr-2" /> Imprimir
                        </Button>
                        <Button onClick={handleDownloadPDF} variant="outline" className="border-slate-300">
                            <Download className="h-4 w-4 mr-2" /> Descargar PDF
                        </Button>
                        {onEdit && (
                            <Button onClick={onEdit} variant="outline" className="border-slate-300">
                                <Edit className="h-4 w-4 mr-2" /> Editar
                            </Button>
                        )}
                        {onDelete && (
                            <Button onClick={onDelete} variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Component for Sidebar
function VitalCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-medium text-slate-600">{label}</span>
            </div>
            <span className="font-bold text-sm text-slate-900">{value}</span>
        </div>
    );
}