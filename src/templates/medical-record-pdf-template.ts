/**
 * Plantilla HTML para PDF de Historias Clínicas
 * Modifica este archivo para cambiar el diseño del PDF
 */

export const medicalRecordPDFTemplate = `
<div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; color: #0f172a; background: #ffffff; width: 794px; max-width: 794px; margin: 0 auto; line-height: 1.6; box-sizing: border-box; overflow: visible;">
    
    <!-- HEADER MODERNO CON LOGO -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 35px 45px; color: white; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Elementos decorativos sutiles -->
        <div style="position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -60px; left: -60px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
        
        <div style="display: flex; align-items: center; gap: 25px; position: relative; z-index: 1;">
            <div style="width: 100px; height: 100px; background: white; padding: 8px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box;">
                <img src="{{logoUrl}}" alt="VetClinic Logo" style="width: 100%; height: 100%; object-fit: contain; max-width: 84px; max-height: 84px; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: #4F46E5; font-size: 32px; font-weight: bold;\\'>VC</div>';" />
            </div>
            <div style="flex: 1;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); line-height: 1.2;">
                    HISTORIA CLÍNICA
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 15px; opacity: 0.9; font-weight: 400; letter-spacing: 0.5px;">
                    Documento Médico Veterinario Oficial
                </p>
            </div>
        </div>
    </div>

    <!-- INFORMACIÓN DEL PACIENTE - DISEÑO MEJORADO -->
    <div style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); padding: 30px 45px; border-bottom: 4px solid #4F46E5;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 20px; box-sizing: border-box;">
            <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700; margin-bottom: 8px;">Paciente</div>
                <div style="font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">{{patientName}}</div>
            </div>
            <div style="text-align: right; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(79, 70, 229, 0.1); border: 2px solid #e0e7ff;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700; margin-bottom: 8px;">Consulta N°</div>
                <div style="font-size: 28px; font-weight: 800; color: #4F46E5;">#{{id}}</div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; background: white; padding: 20px; border-radius: 10px; margin-top: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #4F46E5 0%, #6366f1 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">📅</div>
                <div>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600;">Fecha de Consulta</div>
                    <div style="font-size: 15px; color: #0f172a; font-weight: 700;">{{recordDate}} {{recordTime}}</div>
                </div>
            </div>
            {{followUpBadge}}
        </div>
    </div>

    <!-- SIGNOS VITALES - DISEÑO PREMIUM -->
    <div style="padding: 35px 45px; background: white;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 25px;">
            <div style="width: 5px; height: 35px; background: linear-gradient(180deg, #4F46E5 0%, #7c3aed 100%); border-radius: 3px;"></div>
            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                Signos Vitales
            </h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; box-sizing: border-box;">
            <!-- Peso -->
            <div style="background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 4px 16px rgba(14, 165, 233, 0.15); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                <div style="font-size: 32px; margin-bottom: 10px;">⚖️</div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0ea5e9; font-weight: 700; margin-bottom: 12px;">Peso</div>
                <div style="font-size: 32px; font-weight: 800; color: #0369a1; letter-spacing: -1px;">{{weight}}</div>
            </div>
            <!-- Temperatura -->
            <div style="background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%); border: 2px solid #f43f5e; border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 4px 16px rgba(244, 63, 94, 0.15); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                <div style="font-size: 32px; margin-bottom: 10px;">🌡️</div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f43f5e; font-weight: 700; margin-bottom: 12px;">Temperatura</div>
                <div style="font-size: 32px; font-weight: 800; color: #be123c; letter-spacing: -1px;">{{temperature}}</div>
            </div>
            <!-- Frecuencia Cardíaca -->
            <div style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); border: 2px solid #22c55e; border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 4px 16px rgba(34, 197, 94, 0.15); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                <div style="font-size: 32px; margin-bottom: 10px;">❤️</div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #22c55e; font-weight: 700; margin-bottom: 12px;">Frec. Cardíaca</div>
                <div style="font-size: 32px; font-weight: 800; color: #15803d; letter-spacing: -1px;">{{heartRate}}</div>
            </div>
        </div>
    </div>

    <!-- SECCIÓN DE SÍNTOMAS -->
    {{symptomsSection}}

    <!-- DIAGNÓSTICO MÉDICO - DISEÑO MEJORADO -->
    <div style="padding: 35px 45px; background: #ffffff;">
        <div style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(79, 70, 229, 0.1); border-left: 5px solid #4F46E5;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #6366f1 100%); padding: 20px 28px; color: white; display: flex; align-items: center; gap: 12px;">
                <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🔬</div>
                <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.3px;">
                    Diagnóstico Médico
                </h2>
            </div>
            <div style="padding: 28px; line-height: 1.8; font-size: 14px; color: #1e293b; background: white; min-height: 60px;">
                {{diagnosis}}
            </div>
        </div>
    </div>

    <!-- PLAN DE TRATAMIENTO - DISEÑO MEJORADO -->
    <div style="padding: 0 45px 35px 45px; background: #ffffff;">
        <div style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(34, 197, 94, 0.1); border-left: 5px solid #22c55e;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #34d399 100%); padding: 20px 28px; color: white; display: flex; align-items: center; gap: 12px;">
                <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">💊</div>
                <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.3px;">
                    Plan de Tratamiento
                </h2>
            </div>
            <div style="padding: 28px; line-height: 1.8; font-size: 14px; color: #1e293b; background: white; min-height: 60px;">
                {{treatment}}
            </div>
        </div>
    </div>

    <!-- NOTAS CLÍNICAS -->
    {{notesSection}}

    <!-- FOOTER PROFESIONAL MEJORADO -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 45px; margin-top: 50px; box-shadow: 0 -4px 20px rgba(0,0,0,0.1);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; box-sizing: border-box;">
            <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin-bottom: 10px; font-weight: 600;">Veterinario Responsable</div>
                <div style="font-size: 18px; font-weight: 700; color: #e0e7ff;">Dr. {{veterinarianName}}</div>
            </div>
            {{followUpDateSection}}
        </div>
        <div style="border-top: 2px solid rgba(255,255,255,0.15); padding-top: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div style="font-size: 11px; opacity: 0.8; font-weight: 500;">
                📄 Documento generado el {{generatedDate}}
            </div>
            <div style="font-size: 11px; opacity: 0.9; font-weight: 700; letter-spacing: 0.5px;">
                VetClinic Pro © Sistema de Gestión Veterinaria Profesional
            </div>
        </div>
    </div>
</div>
`;

/**
 * Función helper para reemplazar variables en el template
 */
export function renderMedicalRecordTemplate(template: string, data: Record<string, string>): string {
    let html = template;
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const value = data[key];
        // Asegurar que siempre haya un valor (incluso si es cadena vacía, convertirla a string)
        const replacement = value !== null && value !== undefined ? String(value) : '';
        html = html.replace(regex, replacement);
    });
    
    // Debug: Verificar que los signos vitales se reemplazaron
    if (html.includes('{{weight}}') || html.includes('{{temperature}}') || html.includes('{{heartRate}}')) {
        console.warn('⚠️ Algunos placeholders no se reemplazaron:', {
            hasWeight: !html.includes('{{weight}}'),
            hasTemperature: !html.includes('{{temperature}}'),
            hasHeartRate: !html.includes('{{heartRate}}'),
            dataKeys: Object.keys(data)
        });
    }
    
    return html;
}

