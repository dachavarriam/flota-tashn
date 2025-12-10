import { useState, useEffect, FormEvent, useRef } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { vehiculosApi } from '../api/vehiculos';
import { usuariosApi } from '../api/usuarios';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion, CreateAsignacionDto, UpdateAsignacionDto } from '../types/asignacion';
import type { Vehiculo } from '../types/vehiculo';
import type { Usuario } from '../types/usuario';
import type { DockAction } from '../App';
import SignatureCanvas from 'react-signature-canvas'; // Import Signature
import './AsignacionForm.css';
import { 
  Car, 
  Fuel, 
  Lightbulb, 
  Disc, 
  Circle, 
  Eye, 
  Droplet, 
  Thermometer, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FileText,
  Zap,
  Camera,
  X,
  PenTool,
  ShieldAlert,
  CarFront,
  CalendarCheck,
  Eraser
} from 'lucide-react';

interface AsignacionFormProps {
  asignacion?: Asignacion | null;
  currentUser?: Usuario | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  setDockActions?: (actions: DockAction[] | null) => void;
}

// ... (Constants CHECKLIST_GROUPS, FLUIDOS_ITEMS, FOTOS_REQ, FLUIDO_COLORS remain same) ...
const CHECKLIST_GROUPS = [
    {
        title: "Sistema Eléctrico",
        items: [
            { id: 'luces_frontales', label: 'Luces Frontales', icon: <Lightbulb size={20} /> },
            { id: 'luces_traseras', label: 'Luces Traseras', icon: <Lightbulb size={20} /> },
            { id: 'intermitentes', label: 'Intermitentes', icon: <Zap size={20} /> },
            { id: 'bocina', label: 'Bocina', icon: <AlertTriangle size={20} /> },
        ]
    },
    {
        title: "Exterior y Neumáticos",
        items: [
            { id: 'neumaticos', label: 'Neumáticos', icon: <Circle size={20} /> },
            { id: 'repuesto', label: 'Llanta Repuesto', icon: <Disc size={20} /> },
            { id: 'espejos', label: 'Espejos', icon: <Eye size={20} /> },
            { id: 'limpiaparabrisas', label: 'Limpiaparabrisas', icon: <Droplet size={20} /> },
        ]
    },
    {
        title: "Seguridad y Herramientas",
        items: [
            { id: 'freno', label: 'Frenos (Prueba)', icon: <Disc size={20} /> },
            { id: 'gato', label: 'Gato Hidráulico', icon: <Wrench size={20} /> },
            { id: 'herramientas', label: 'Herramientas', icon: <Wrench size={20} /> },
            { id: 'documentos', label: 'Documentos', icon: <FileText size={20} /> },
        ]
    }
];

const FLUIDOS_ITEMS = [
  { id: 'aceite', label: 'Aceite Motor', icon: <Droplet size={20} /> },
  { id: 'refrigerante', label: 'Coolant', icon: <Thermometer size={20} /> },
  { id: 'frenos', label: 'Liq. Frenos', icon: <Disc size={20} /> },
  { id: 'hidraulico', label: 'Hidráulico', icon: <Activity size={20} /> },
];

const FOTOS_REQ = [
    { id: 'frontal', label: 'Frontal' },
    { id: 'lateral_izq', label: 'Lateral Izq' },
    { id: 'lateral_der', label: 'Lateral Der' },
    { id: 'trasera', label: 'Trasera' },
    { id: 'interior', label: 'Interior' },
];

const FLUIDO_COLORS: Record<string, string> = { 'OK': 'success', 'Bajo': 'warning', 'Fuga': 'danger' };
const FLUIDO_STATES_CYCLE = ['OK', 'Bajo', 'Fuga'];

export function AsignacionForm({ asignacion, currentUser, onSuccess, onCancel, setDockActions }: AsignacionFormProps) {
  const isEdit = !!asignacion;

  const [formData, setFormData] = useState({
    vehiculoId: '',
    usuarioId: '',
    encargadoId: '',
    kmSalida: '',
    kmRetorno: '',
    horaSalida: '',
    horaRetorno: '',
    uso: '',
    observaciones: '',
    estado: EstadoAsignacion.ACTIVA
  });

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [checklistDetalles, setChecklistDetalles] = useState<Record<string, string>>({});
  const [niveles, setNiveles] = useState<Record<string, string>>({});
  const [combustible, setCombustible] = useState<number>(100); 
  const [alertasVehiculo, setAlertasVehiculo] = useState<string[]>([]);
  
  const [showSignature, setShowSignature] = useState(false);
  
  // Signature Ref
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [firmaData, setFirmaData] = useState<string | null>(null);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicialización de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiculosData, usuariosData] = await Promise.all([
          vehiculosApi.getAll(),
          usuariosApi.getAll()
        ]);
        setVehiculos(vehiculosData);
        setUsuarios(usuariosData);
      } catch (err) {
        setError("Error cargando datos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (asignacion) {
      setFormData({
        vehiculoId: asignacion.vehiculoId.toString(),
        usuarioId: asignacion.usuarioId.toString(),
        encargadoId: asignacion.encargadoId.toString(),
        kmSalida: asignacion.kmSalida?.toString() || '',
        kmRetorno: asignacion.kmRetorno?.toString() || '',
        horaSalida: asignacion.horaSalida || '',
        horaRetorno: asignacion.horaRetorno || '',
        uso: asignacion.uso || '',
        observaciones: asignacion.observaciones || '',
        estado: asignacion.estado
      });
      if (asignacion.checklist) setChecklist(asignacion.checklist as Record<string, boolean>);
      if (asignacion.niveles) {
          const niv = asignacion.niveles as Record<string, any>;
          setNiveles(niv);
          if (niv.combustible !== undefined) setCombustible(parseInt(niv.combustible));
      }
      // If signature exists, we could load it, but usually we just show it's signed
      if (asignacion.firmaUsuario) setFirmaData(asignacion.firmaUsuario);
    } else if (currentUser) {
      setFormData(prev => ({ ...prev, encargadoId: currentUser.id.toString() }));
      const initialChecklist: Record<string, boolean> = {};
      CHECKLIST_GROUPS.forEach(g => g.items.forEach(i => initialChecklist[i.id] = true));
      setChecklist(initialChecklist);
      const initialNiveles: Record<string, string> = {};
      FLUIDOS_ITEMS.forEach(item => initialNiveles[item.id] = 'OK');
      setNiveles(initialNiveles);
    }
  }, [asignacion, currentUser]);

  const handleVehiculoChange = (vehiculoId: string) => {
    handleChange('vehiculoId', vehiculoId);
    const v = vehiculos.find(v => v.id.toString() === vehiculoId);
    if (v) {
        setFormData(prev => ({ ...prev, kmSalida: v.kmActual.toString() }));
        if (v.kmActual > 100000) setAlertasVehiculo(["Revisión preventiva sugerida"]);
        else setAlertasVehiculo([]);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNivelCycle = (id: string) => {
      if (isEdit && formData.estado === EstadoAsignacion.FINALIZADA) return;
      setNiveles(prev => {
          const current = prev[id] || 'OK';
          const idx = FLUIDO_STATES_CYCLE.indexOf(current);
          const next = FLUIDO_STATES_CYCLE[(idx + 1) % FLUIDO_STATES_CYCLE.length];
          return { ...prev, [id]: next };
      });
  };

  const handleChecklistToggle = (id: string) => {
    if (isEdit && formData.estado === EstadoAsignacion.FINALIZADA) return;
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
    if (!checklist[id]) { 
        setChecklistDetalles(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }
  };

  const handleChecklistDetalle = (id: string, value: string) => {
      setChecklistDetalles(prev => ({ ...prev, [id]: value }));
  };

  // Guardar firma desde el Canvas
  const handleSignatureSave = () => {
      if (sigCanvas.current) {
          if (sigCanvas.current.isEmpty()) {
              alert("Por favor firme antes de confirmar");
              return;
          }
          // Get Base64 image
          const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
          setFirmaData(dataUrl);
          setShowSignature(false);
          
          // Trigger submit after slight delay to allow state update
          setTimeout(() => handleSubmitInternal(dataUrl), 100);
      }
  };

  const clearSignature = () => {
      sigCanvas.current?.clear();
  };

  const getSliderColor = (val: number) => {
      if (val <= 25) return '#ea4335';
      if (val <= 50) return '#fbbc04';
      return '#34a853';
  };

  const handleSubmitInternal = async (signatureUrl?: string) => {
    setLoading(true);
    const nivelesFinal = { ...niveles, combustible };
    let obs = formData.observaciones;
    const detalles = Object.keys(checklistDetalles);
    if (detalles.length > 0) {
        obs += "\n\n[Fallas Reportadas]:\n" + detalles.map(k => {
             let label = k;
             CHECKLIST_GROUPS.forEach(g => {
                 const i = g.items.find(it => it.id === k);
                 if (i) label = i.label;
             });
             return `- ${label}: ${checklistDetalles[k]}`;
        }).join('\n');
    }

    try {
      // Common payload
      const payloadBase = {
          observaciones: obs || undefined,
          checklist, 
          niveles: nivelesFinal,
          firmaUsuario: signatureUrl || firmaData || undefined
      };

      if (isEdit && asignacion) {
        await asignacionesApi.update(asignacion.id, {
            ...payloadBase,
            estado: formData.estado,
            kmRetorno: formData.kmRetorno ? parseInt(formData.kmRetorno) : undefined,
            horaRetorno: formData.horaRetorno || undefined,
        });
      } else {
        await asignacionesApi.create({
          ...payloadBase,
          vehiculoId: parseInt(formData.vehiculoId),
          usuarioId: parseInt(formData.usuarioId),
          encargadoId: parseInt(formData.encargadoId),
          kmSalida: formData.kmSalida ? parseInt(formData.kmSalida) : undefined,
          uso: formData.uso || undefined,
        });
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // --- DOCK ACTION INJECTION ---
  useEffect(() => {
      if (setDockActions) {
          setDockActions([
              {
                  label: 'Cancelar',
                  icon: <X size={20} />,
                  onClick: () => onCancel?.(),
                  variant: 'danger'
              },
              {
                  label: 'Firmar y Guardar',
                  icon: <PenTool size={20} />,
                  onClick: () => setShowSignature(true),
                  variant: 'primary'
              }
          ]);
      }
      return () => {
          setDockActions?.(null);
      };
  }, [setDockActions, onCancel]);

  if (loadingData) return <div className="loading">Cargando...</div>;

  return (
    <div className="asignacion-form-container">
      
      {/* HEADER TIPO HAMBURGUESA / PRODUCTO */}
      <div className="form-header-hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <CarFront size={80} className="hero-car-icon" />
          <h2 className="hero-title">{isEdit ? 'Gestionar Asignación' : 'Nueva Asignación'}</h2>
          <p className="hero-subtitle">Inspección de {vehiculos.find(v => v.id.toString() === formData.vehiculoId)?.placa || 'vehículo'}</p>
        </div>
      </div>

      <form className="asignacion-form app-card-rounded" onSubmit={(e) => e.preventDefault()}> 

         <div className="main-layout"> 
             <div className="layout-col left-col"> 
                 <div className="form-section">
                    <h3><Car className="section-icon" /> Datos Generales</h3>
                    <div className="form-group">
                        <label>Vehículo</label>
                        <select value={formData.vehiculoId} onChange={(e) => handleVehiculoChange(e.target.value)} required disabled={isEdit} className="large-input">
                            <option value="">Seleccionar...</option>
                            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
                        </select>
                    </div>
                    {alertasVehiculo.length > 0 && (<div className="alertas-box"><ShieldAlert size={18} /> {alertasVehiculo[0]}</div>)}
                    <div className="form-group">
                        <label>Conductor</label>
                        <select value={formData.usuarioId} onChange={(e) => handleChange('usuarioId', e.target.value)} required disabled={isEdit} className="large-input">
                            <option value="">Seleccionar...</option>
                            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>KM Salida</label>
                            <input type="number" value={formData.kmSalida} onChange={(e) => handleChange('kmSalida', e.target.value)} disabled={isEdit} className="large-input" />
                        </div>
                        <div className="form-group">
                            <label>Destino</label>
                            <input type="text" value={formData.uso} onChange={(e) => handleChange('uso', e.target.value)} disabled={isEdit} placeholder="Ruta..." className="large-input" />
                        </div>
                    </div>
                 </div>

                 <div className="form-section highlight-section">
                    <h3><Fuel size={20} /> Combustible: {combustible}%</h3>
                    <div className="fuel-slider-container">
                        <input 
                            type="range" min="0" max="100" step="12.5" 
                            value={combustible} onChange={(e) => setCombustible(parseInt(e.target.value))}
                            disabled={isEdit && formData.estado === EstadoAsignacion.FINALIZADA}
                            className="fuel-slider-styled"
                            style={{background: `linear-gradient(to right, ${getSliderColor(combustible)} 0%, ${getSliderColor(combustible)} ${combustible}%, #e0e0e0 ${combustible}%, #e0e0e0 100%)`}}
                        />
                        <div className="fuel-ticks"><span>E</span><span>1/4</span><span>1/2</span><span>3/4</span><span>F</span></div>
                    </div>
                 </div>

                 <div className="form-section">
                    <h3><Droplet size={20} /> Fluidos</h3>
                    <div className="fluidos-list">
                        {FLUIDOS_ITEMS.map(item => (
                            <div key={item.id} className={`fluido-row ${FLUIDO_COLORS[niveles[item.id] || 'OK']}`} onClick={() => handleNivelCycle(item.id)}>
                                <div className="fluido-icon-wrapper">{item.icon}</div>
                                <span className="fluido-label">{item.label}</span>
                                <div className={`fluido-btn-state ${FLUIDO_COLORS[niveles[item.id] || 'OK']}`}>{niveles[item.id] || 'OK'}</div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>

             <div className="layout-col right-col"> 
                 <div className="form-section">
                    <h3><CalendarCheck className="section-icon" /> Inspección</h3>
                    <div className="checklist-groups-container">
                        {CHECKLIST_GROUPS.map((group, idx) => (
                            <div key={idx} className="checklist-group">
                                <h4 className="group-title">{group.title}</h4>
                                <div className="checklist-list">
                                    {group.items.map(item => (
                                        <div key={item.id} className={`checklist-row ${checklist[item.id] ? 'ok' : 'fail'}`}>
                                            <div className="row-main" onClick={() => handleChecklistToggle(item.id)}>
                                                <div className="row-info">
                                                    <div className="row-icon">{item.icon}</div>
                                                    <span className="row-label">{item.label}</span>
                                                </div>
                                                <div className={`switch-toggle ${checklist[item.id] ? 'active' : ''}`}><div className="switch-handle"></div></div>
                                            </div>
                                            {!checklist[item.id] && (
                                                <div className="row-detail">
                                                    <input type="text" placeholder="Describa la falla..." value={checklistDetalles[item.id] || ''} onChange={(e) => handleChecklistDetalle(item.id, e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="form-section">
                     <h3><Camera className="section-icon" /> Fotos</h3>
                     <div className="photos-grid">
                         {FOTOS_REQ.map(photo => (
                             <div key={photo.id} className="photo-slot">
                                 <div className="photo-placeholder"><Camera size={24} strokeWidth={1.5} /><span>{photo.label}</span></div>
                                 <button type="button" className="btn-upload">Cargar</button>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         </div>

        {isEdit && (
             <div className="form-section highlight-section">
                <h3>Cierre</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Estado</label>
                        <select value={formData.estado} onChange={(e) => handleChange('estado', e.target.value as any)} className="large-input">
                            {Object.values(EstadoAsignacion).map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>KM Retorno</label>
                        <input type="number" value={formData.kmRetorno} onChange={(e) => handleChange('kmRetorno', e.target.value)} className="large-input" />
                    </div>
                </div>
             </div>
        )}

        <div className="form-group">
          <label>Observaciones Generales</label>
          <textarea rows={2} value={formData.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
      </form>

      {/* SIGNATURE MODAL */}
      {showSignature && (
          <div className="signature-modal-overlay">
              <div className="signature-modal">
                  <div className="modal-header">
                      <h3>Firma del Conductor</h3>
                      <button onClick={() => setShowSignature(false)} className="modal-close-btn"><X /></button>
                  </div>
                  <div className="signature-area-wrapper">
                      <SignatureCanvas 
                          ref={sigCanvas}
                          penColor="black"
                          canvasProps={{className: 'signature-canvas'}}
                      />
                      <button type="button" className="btn-clear-sig" onClick={clearSignature} title="Limpiar">
                          <Eraser size={20} />
                      </button>
                  </div>
                  <div className="modal-actions">
                      <button className="btn-secondary" onClick={() => setShowSignature(false)}>Cancelar</button>
                      <button className="btn-primary" onClick={handleSignatureSave}>Confirmar y Guardar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}