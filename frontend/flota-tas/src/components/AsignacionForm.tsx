import { useState, useEffect, useRef } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { vehiculosApi } from '../api/vehiculos';
import { usuariosApi } from '../api/usuarios';
import { api } from '../api/client';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion } from '../types/asignacion';
import type { Vehiculo } from '../types/vehiculo';
import type { Usuario } from '../types/usuario';
import type { DockAction } from '../App';
import SignatureCanvas from 'react-signature-canvas';
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
  const [loadedAsignacionId, setLoadedAsignacionId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    vehiculoId: string;
    usuarioId: string;
    encargadoId: string;
    kmSalida: string;
    kmRetorno: string;
    horaSalida: string;
    horaRetorno: string;
    uso: string;
    observaciones: string;
    estado: EstadoAsignacion;
  }>({
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

  // Ref to store the latest submit handler (prevents stale closure in dock actions)
  const submitHandlerRef = useRef<() => void>(() => {});

  // Read-only mode and damage report toggle
  const [allowDamageReport, setAllowDamageReport] = useState(false);
  const [tieneDanos, setTieneDanos] = useState(false);

  // Show damage report button when EN_REVISION or FINALIZADA
  const canReportDamage = asignacion?.estado === EstadoAsignacion.EN_REVISION || asignacion?.estado === EstadoAsignacion.FINALIZADA;
  const isReadOnly = (asignacion?.estado === EstadoAsignacion.FINALIZADA || asignacion?.estado === EstadoAsignacion.EN_REVISION) && !allowDamageReport;

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
    // Only load data when asignacion ID changes (prevent re-initialization on updates)
    if (asignacion && asignacion.id !== loadedAsignacionId) {
      const newFormData = {
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
      };

      setFormData(newFormData);
      setLoadedAsignacionId(asignacion.id);

      // Load checklist or initialize with defaults
      if (asignacion.checklist && Object.keys(asignacion.checklist).length > 0) {
        setChecklist(asignacion.checklist as Record<string, boolean>);
      } else {
        // Initialize with all items checked (good condition)
        const initialChecklist: Record<string, boolean> = {};
        CHECKLIST_GROUPS.forEach(g => g.items.forEach(i => initialChecklist[i.id] = true));
        setChecklist(initialChecklist);
      }

      // Load niveles or initialize with defaults
      if (asignacion.niveles && Object.keys(asignacion.niveles).length > 0) {
          const niv = asignacion.niveles as Record<string, any>;
          setNiveles(niv);
          if (niv.combustible !== undefined) setCombustible(parseInt(niv.combustible));
      } else {
        // Initialize with all fluids OK
        const initialNiveles: Record<string, string> = {};
        FLUIDOS_ITEMS.forEach(item => initialNiveles[item.id] = 'OK');
        setNiveles(initialNiveles);
        setCombustible(100); // Default full tank
      }

      // If signature exists, load it
      if (asignacion.firmaUsuario) {
        setFirmaData(asignacion.firmaUsuario);
      }
      // Load damage status
      if (asignacion.tieneDanos) setTieneDanos(asignacion.tieneDanos);
    } else if (currentUser && !asignacion && loadedAsignacionId === null) {
      setFormData(prev => ({ ...prev, encargadoId: currentUser.id.toString() }));
      const initialChecklist: Record<string, boolean> = {};
      CHECKLIST_GROUPS.forEach(g => g.items.forEach(i => initialChecklist[i.id] = true));
      setChecklist(initialChecklist);
      const initialNiveles: Record<string, string> = {};
      FLUIDOS_ITEMS.forEach(item => initialNiveles[item.id] = 'OK');
      setNiveles(initialNiveles);
      setLoadedAsignacionId(-1); // Mark as initialized
    }
  }, [asignacion, currentUser, loadedAsignacionId]);

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
      if (isReadOnly) return;
      setNiveles(prev => {
          const current = prev[id] || 'OK';
          const idx = FLUIDO_STATES_CYCLE.indexOf(current);
          const next = FLUIDO_STATES_CYCLE[(idx + 1) % FLUIDO_STATES_CYCLE.length];
          return { ...prev, [id]: next };
      });
  };

  const handleChecklistToggle = (id: string) => {
    if (isReadOnly) return;
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
          // Get Base64 image directly from canvas
          const dataUrl = sigCanvas.current.toDataURL('image/png');
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

  // Helper to convert base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Upload signature to server
  const uploadSignature = async (asignacionId: number, base64Data: string): Promise<string> => {
    const file = base64ToFile(base64Data, 'signature.png');
    const formData = new FormData();
    formData.append('signature', file);

    const response = await api.post(`/asignaciones/${asignacionId}/upload-signature`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
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
      // Common payload base (without signature for now)
      const payloadBase = {
          observaciones: obs || undefined,
          checklist,
          niveles: nivelesFinal,
      };

      let savedAsignacion;

      if (isEdit && asignacion) {
        // Build update payload
        const updatePayload: any = {
            ...payloadBase,
            kmRetorno: formData.kmRetorno ? parseInt(formData.kmRetorno) : undefined,
            horaRetorno: formData.horaRetorno || undefined,
            tieneDanos: tieneDanos || undefined,
        };

        // Only send estado if it's FINALIZADA or CANCELADA (manual transitions)
        // For automatic transitions (ACTIVA -> EN_REVISION), let backend handle it
        if (formData.estado === EstadoAsignacion.FINALIZADA || formData.estado === EstadoAsignacion.CANCELADA) {
          updatePayload.estado = formData.estado;
        }

        savedAsignacion = await asignacionesApi.update(asignacion.id, updatePayload);
      } else {
        savedAsignacion = await asignacionesApi.create({
          ...payloadBase,
          vehiculoId: parseInt(formData.vehiculoId),
          usuarioId: parseInt(formData.usuarioId),
          encargadoId: parseInt(formData.encargadoId),
          kmSalida: formData.kmSalida ? parseInt(formData.kmSalida) : undefined,
          uso: formData.uso || undefined,
        });
      }

      // Upload signature if exists (only for new signatures, not existing ones)
      if (signatureUrl && savedAsignacion?.id) {
        const uploadedSignatureUrl = await uploadSignature(savedAsignacion.id, signatureUrl);
        // Update asignacion with signature URL
        await asignacionesApi.update(savedAsignacion.id, {
          firmaUsuario: uploadedSignatureUrl
        });
      }

      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Error in handleSubmitInternal:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error message:', err.message);
      setError(err.response?.data?.message || err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // Update the ref on every render to capture latest state
  useEffect(() => {
    submitHandlerRef.current = () => handleSubmitInternal();
  });

  // --- DOCK ACTION INJECTION ---
  useEffect(() => {
      if (setDockActions) {
          const actions = [
              {
                  label: 'Cancelar',
                  icon: <X size={20} />,
                  onClick: () => onCancel?.(),
                  variant: 'danger' as const
              }
          ];

          // Only show "Firmar y Guardar" for new assignments
          // For editing (EN_REVISION, FINALIZADA, etc), just "Guardar"
          if (!isEdit) {
              actions.push({
                  label: 'Firmar y Guardar',
                  icon: <PenTool size={20} />,
                  onClick: () => setShowSignature(true),
                  variant: 'primary' as const
              });
          } else {
              actions.push({
                  label: 'Guardar',
                  icon: <CheckCircle2 size={20} />,
                  onClick: () => submitHandlerRef.current?.(),
                  variant: 'primary' as const
              });
          }

          setDockActions(actions);
      }
      return () => {
          setDockActions?.(null);
      };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  if (loadingData) return <div className="loading">Cargando...</div>;

  return (
    <div className="asignacion-form-container">
      
      {/* HEADER TIPO HAMBURGUESA / PRODUCTO */}
      <div className="form-header-hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <CarFront size={80} className="hero-car-icon" />
          <h2 className="hero-title">
            {isEdit ? 'Gestionar Asignación' : 'Nueva Asignación'}
            {asignacion?.numeroRegistro && (
              <span style={{
                marginLeft: '1rem',
                fontSize: '1rem',
                fontWeight: '800',
                color: '#1e293b',
                background: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                letterSpacing: '1px'
              }}>
                {asignacion.numeroRegistro}
              </span>
            )}
          </h2>
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
                        <select value={formData.vehiculoId} onChange={(e) => handleVehiculoChange(e.target.value)} required disabled={isEdit || isReadOnly} className="large-input">
                            <option value="">Seleccionar...</option>
                            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
                        </select>
                    </div>
                    {alertasVehiculo.length > 0 && (<div className="alertas-box"><ShieldAlert size={18} /> {alertasVehiculo[0]}</div>)}
                    <div className="form-group">
                        <label>Conductor</label>
                        <select value={formData.usuarioId} onChange={(e) => handleChange('usuarioId', e.target.value)} required disabled={isEdit || isReadOnly} className="large-input">
                            <option value="">Seleccionar...</option>
                            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>KM Salida</label>
                            <input type="number" value={formData.kmSalida} onChange={(e) => handleChange('kmSalida', e.target.value)} disabled={isEdit || isReadOnly} className="large-input" />
                        </div>
                        <div className="form-group">
                            <label>Destino</label>
                            <input type="text" value={formData.uso} onChange={(e) => handleChange('uso', e.target.value)} disabled={isEdit || isReadOnly} placeholder="Ruta..." className="large-input" />
                        </div>
                    </div>
                 </div>

                 <div className="form-section highlight-section">
                    <h3><Fuel size={20} /> Combustible: {combustible}%</h3>
                    <div className="fuel-slider-container">
                        <input
                            type="range" min="0" max="100" step="12.5"
                            value={combustible} onChange={(e) => setCombustible(parseInt(e.target.value))}
                            disabled={isReadOnly}
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
                            <div
                                key={item.id}
                                className={`fluido-row ${FLUIDO_COLORS[niveles[item.id] || 'OK']}`}
                                onClick={() => !isReadOnly && handleNivelCycle(item.id)}
                                style={{cursor: isReadOnly ? 'not-allowed' : 'pointer', opacity: isReadOnly ? 0.6 : 1}}
                            >
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
                                            <div
                                                className="row-main"
                                                onClick={() => handleChecklistToggle(item.id)}
                                                style={{cursor: isReadOnly ? 'not-allowed' : 'pointer', opacity: isReadOnly ? 0.6 : 1}}
                                            >
                                                <div className="row-info">
                                                    <div className="row-icon">{item.icon}</div>
                                                    <span className="row-label">{item.label}</span>
                                                </div>
                                                <div className={`switch-toggle ${checklist[item.id] ? 'active' : ''}`}><div className="switch-handle"></div></div>
                                            </div>
                                            {!checklist[item.id] && (
                                                <div className="row-detail">
                                                    <input
                                                        type="text"
                                                        placeholder="Describa la falla..."
                                                        value={checklistDetalles[item.id] || ''}
                                                        onChange={(e) => handleChecklistDetalle(item.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isReadOnly}
                                                        autoFocus
                                                    />
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
                                 <button type="button" className="btn-upload" disabled={isReadOnly} style={{opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer'}}>Cargar</button>
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
                        <label>Estado Actual</label>
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontWeight: '700',
                            fontSize: '1rem',
                            color: '#1e293b'
                        }}>
                            {formData.estado.replace('_', ' ')}
                        </div>
                        <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem'}}>
                            {formData.estado === EstadoAsignacion.ACTIVA && '• Se cambiará a EN REVISIÓN al ingresar KM Retorno'}
                            {formData.estado === EstadoAsignacion.EN_REVISION && '• Revise daños y marque como FINALIZADA'}
                        </p>
                    </div>
                    <div className="form-group">
                        <label>KM Retorno</label>
                        <input
                            type="number"
                            value={formData.kmRetorno}
                            onChange={(e) => handleChange('kmRetorno', e.target.value)}
                            className="large-input"
                            placeholder={formData.estado === EstadoAsignacion.ACTIVA ? 'Ingrese para marcar como entregado' : ''}
                        />
                    </div>
                </div>
                {formData.estado === EstadoAsignacion.EN_REVISION && (
                    <div className="form-row" style={{marginTop: '1rem'}}>
                        <div className="form-group">
                            <label>Acciones de Supervisor</label>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <button
                                    type="button"
                                    onClick={() => handleChange('estado', EstadoAsignacion.FINALIZADA)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✓ Marcar como Finalizada
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange('estado', EstadoAsignacion.CANCELADA)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✗ Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        )}

        <div className="form-group">
          <label>Observaciones Generales</label>
          <textarea rows={2} value={formData.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} disabled={isReadOnly} />
        </div>

        {/* Signature saved confirmation (image will be used in PDF) */}
        {asignacion?.firmaUsuario && (
          <div style={{
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '2px solid #86efac',
            textAlign: 'center',
            color: '#15803d',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={20} />
            <span>Firma guardada correctamente</span>
          </div>
        )}

        {/* DAMAGE REPORT TOGGLE (for EN_REVISION or FINALIZADA) - At end of form */}
        {canReportDamage && (
          <div style={{
            padding: '1.5rem',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            margin: '1rem 0'
          }}>
            <button
              type="button"
              onClick={() => {
                setAllowDamageReport(!allowDamageReport);
                if (!allowDamageReport) {
                  setTieneDanos(true);
                }
              }}
              style={{
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: allowDamageReport ? '3px solid #ef4444' : '2px solid #94a3b8',
                background: allowDamageReport ? '#fef2f2' : '#ffffff',
                color: allowDamageReport ? '#ef4444' : '#64748b',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '0 auto',
                boxShadow: allowDamageReport ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <ShieldAlert size={24} />
              <span>{allowDamageReport ? '🔴 Reportando Daños' : '¿Tiene Daños?'}</span>
            </button>
            <p style={{
              marginTop: '0.75rem',
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {allowDamageReport
                ? 'Marca los daños encontrados en la inspección de retorno'
                : 'Click aquí si el vehículo presenta daños al recibirlo'}
            </p>
          </div>
        )}

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