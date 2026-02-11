import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InformedConsent } from '@/services/informedConsentService';
import { 
  CheckCircle2, Trash2, FileText, AlertTriangle, 
  ThumbsUp, GitBranch, PenTool, Calendar, ShieldCheck 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";

interface InformedConsentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  consent?: InformedConsent;
  onSign?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function InformedConsentDetailsDialog({
  open,
  onClose,
  consent,
  onSign,
  onDelete,
}: InformedConsentDetailsDialogProps) {
  if (!consent) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-slate-50">
        
        {/* --- HEADER --- */}
        <div className="px-8 py-6 bg-white border-b flex justify-between items-start shrink-0 shadow-sm z-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-serif font-bold text-slate-900">
                            Consentimiento Informado
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                            Ref: DOC-{consent.id.toString().padStart(6, '0')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div>
                {consent.isSigned ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <div className="text-left">
                            <p className="text-xs font-bold text-emerald-700 uppercase">Documento Legalizado</p>
                            <p className="text-[10px] text-emerald-600">
                                {format(new Date(consent.signedDate!), "d MMM yyyy • HH:mm", { locale: es })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 animate-pulse">
                        <PenTool className="w-3 h-3 mr-2" /> PENDIENTE DE FIRMA
                    </Badge>
                )}
            </div>
        </div>

        {/* --- DOCUMENT BODY (SCROLLABLE) --- */}
        <ScrollArea className="flex-1 bg-slate-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-lg border border-slate-200 min-h-full rounded-sm p-8 md:p-12 font-serif text-slate-800 leading-relaxed">
                
                {/* Paciente Info */}
                <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center font-sans">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Paciente</p>
                        <p className="text-lg font-semibold">{consent.patientName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Procedimiento</p>
                        <p className="text-lg font-semibold text-blue-700">{consent.procedureType}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold border-b pb-2 mb-4 font-sans text-slate-900">1. Descripción del Procedimiento</h3>
                        <p className="text-base text-slate-700 whitespace-pre-wrap">
                            {consent.procedureDescription || consent.description}
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        {consent.risks && (
                            <section className="bg-red-50 p-5 rounded-xl border border-red-100">
                                <h3 className="flex items-center gap-2 text-base font-bold mb-3 text-red-800 font-sans">
                                    <AlertTriangle className="w-4 h-4" /> Riesgos Potenciales
                                </h3>
                                <p className="text-sm text-red-900/80 whitespace-pre-wrap font-sans">
                                    {consent.risks}
                                </p>
                            </section>
                        )}

                        {consent.benefits && (
                            <section className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                                <h3 className="flex items-center gap-2 text-base font-bold mb-3 text-emerald-800 font-sans">
                                    <ThumbsUp className="w-4 h-4" /> Beneficios Esperados
                                </h3>
                                <p className="text-sm text-emerald-900/80 whitespace-pre-wrap font-sans">
                                    {consent.benefits}
                                </p>
                            </section>
                        )}
                    </div>

                    {consent.alternatives && (
                        <section>
                            <h3 className="flex items-center gap-2 text-lg font-bold border-b pb-2 mb-4 font-sans text-slate-900">
                                <GitBranch className="w-5 h-5 text-slate-500" /> Alternativas
                            </h3>
                            <p className="text-base text-slate-700 whitespace-pre-wrap">
                                {consent.alternatives}
                            </p>
                        </section>
                    )}

                    {/* SIGNATURE SECTION */}
                    <div className="mt-12 pt-8 border-t-2 border-slate-100">
                        {consent.isSigned ? (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-emerald-500 border-dashed bg-emerald-50/30 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stamp.png')]" />
                                <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
                                <p className="text-emerald-700 font-bold text-lg font-sans">FIRMADO DIGITALMENTE</p>
                                <p className="text-emerald-600/80 text-sm font-mono mt-1">{consent.ownerSignature}</p>
                                <p className="text-xs text-muted-foreground mt-4 font-sans">
                                    Fecha: {format(new Date(consent.signedDate!), "dd/MM/yyyy HH:mm:ss")}
                                </p>
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-slate-300 border-dashed rounded-xl text-center bg-slate-50">
                                <div className="w-64 h-12 border-b border-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 font-sans uppercase tracking-widest">Firma del Propietario</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollArea>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-4 bg-white border-t flex justify-between items-center shrink-0 z-10">
            <div className="text-xs text-muted-foreground hidden md:block">
                Creado el {format(new Date(consent.createdAt), "dd/MM/yyyy")} • Este documento es legal y vinculante.
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
                {onDelete && (
                    <Button variant="ghost" onClick={() => onDelete(consent.id)} className="text-red-500 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                    </Button>
                )}
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                {!consent.isSigned && onSign && (
                    <Button onClick={() => onSign(consent.id)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        <PenTool className="mr-2 h-4 w-4" /> Firmar Ahora
                    </Button>
                )}
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}