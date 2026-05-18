import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assignmentAPI, courseAPI, serviceAPI } from '../services/api';

/* ══════════════════════════════════════════════════════════════
   Formulaire carte bancaire (UI — aucun paiement réel traité)
══════════════════════════════════════════════════════════════ */
function CardForm({ onConfirm, submitting, cartTotal }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors] = useState({});

  const fmt = {
    number: (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(),
    expiry: (v) => {
      const d = v.replace(/\D/g, '').slice(0, 4);
      return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    },
    cvv:  (v) => v.replace(/\D/g, '').slice(0, 3),
    name: (v) => v.slice(0, 40),
  };

  const handleChange = (field) => (e) => {
    setCard(p => ({ ...p, [field]: fmt[field](e.target.value) }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Numéro de carte invalide';
    if (card.expiry.length < 5)  e.expiry = 'Date invalide';
    if (card.cvv.length < 3)     e.cvv    = 'CVV invalide';
    if (!card.name.trim())       e.name   = 'Nom requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const input = (label, field, placeholder, half = false) => (
    <div style={{ flex: half ? '1' : '1 1 100%', minWidth: half ? 120 : 'unset' }}>
      <label style={{ fontSize: 11, fontWeight: 800, color: '#546E7A', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        value={card[field]}
        onChange={handleChange(field)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: 'Nunito, sans-serif',
          border: `1.5px solid ${errors[field] ? '#EF5350' : '#E8EAF6'}`,
          background: errors[field] ? '#FFF5F5' : '#f8f9ff', color: '#1A237E', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {errors[field] && <div style={{ color: '#C62828', fontSize: 11, marginTop: 3, fontWeight: 700 }}>⚠ {errors[field]}</div>}
    </div>
  );

  return (
    <div>
      {/* Visuel carte */}
      <div style={{
        background: 'linear-gradient(135deg, #1565C0, #0D47A1)', borderRadius: 16, padding: '20px 24px',
        color: 'white', marginBottom: 20, position: 'relative', minHeight: 130,
      }}>
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 16, letterSpacing: 1 }}>CARTE BANCAIRE</div>
        <div style={{ fontSize: 18, letterSpacing: 4, fontWeight: 700, marginBottom: 16 }}>
          {card.number || '•••• •••• •••• ••••'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <div>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>TITULAIRE</div>
            <div style={{ fontWeight: 700 }}>{card.name || 'NOM PRÉNOM'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>EXPIRE</div>
            <div style={{ fontWeight: 700 }}>{card.expiry || 'MM/AA'}</div>
          </div>
        </div>
        {/* Logos cartes */}
        <div style={{ position: 'absolute', top: 18, right: 20, display: 'flex', gap: 6 }}>
          {['VISA', 'MC'].map(b => (
            <span key={b} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 900 }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Champs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {input('Numéro de carte', 'number', '1234 5678 9012 3456')}
        {input('Titulaire de la carte', 'name', 'JEAN DUPONT')}
        <div style={{ display: 'flex', gap: 12 }}>
          {input("Date d'expiration", 'expiry', 'MM/AA', true)}
          {input('CVV', 'cvv', '123', true)}
        </div>
      </div>

      {/* Sécurité */}
      <div style={{ background: '#E8F5E9', border: '1.5px solid #C8E6C9', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#2E7D32', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 16 }}>🔒</span>
        <span><strong>Paiement sécurisé SSL.</strong> Vos données bancaires ne sont jamais stockées.</span>
      </div>

      <button
        onClick={() => { if (validate()) onConfirm(); }}
        disabled={submitting}
        style={{
          width: '100%', padding: '15px', borderRadius: 12, border: 'none',
          background: submitting ? '#90A4AE' : 'linear-gradient(135deg, #1565C0, #1976D2)',
          color: 'white', fontSize: 15, fontWeight: 900, cursor: submitting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
        {submitting
          ? <><Spinner /> Traitement en cours…</>
          : <>💳 Payer ${cartTotal.toFixed(2)}</>}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" opacity="0.3" />
      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════ */
export default function SubmitAssignment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [courses, setCourses]   = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [current, setCurrent] = useState({ course: '', service: '', file: null });
  const [preview, setPreview]   = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cart, setCart]         = useState([]);
  const [step, setStep]         = useState('build');   // 'build' | 'review' | 'payment'
  const [paymentMethod, setPaymentMethod] = useState(null); // 'card' | 'cash'
  const [error, setError]       = useState('');

  const courseParam = searchParams.get('course');

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([courseAPI.getAll(), serviceAPI.getAll()]);
        setCourses(c);
        setServices(s);
        if (courseParam) setCurrent(p => ({ ...p, course: courseParam }));
      } catch {
        setError('Impossible de charger les cours et services.');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseParam]);

  /* ── Fichier ── */
  const validateFile = (file) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setError('Seuls PDF et Word sont acceptés.'); return false; }
    if (file.size > 10 * 1024 * 1024) { setError('Fichier trop grand (max 10 Mo).'); return false; }
    return true;
  };
  const applyFile  = (file) => { if (!validateFile(file)) return; setCurrent(p => ({ ...p, file })); setPreview({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2), type: file.type }); setError(''); };
  const handleFileChange = (e) => { if (e.target.files[0]) applyFile(e.target.files[0]); };
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) applyFile(e.dataTransfer.files[0]); };
  const removeFile = () => { setCurrent(p => ({ ...p, file: null })); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  /* ── Panier ── */
  const addToCart = () => {
    setError('');
    if (!current.course)  { setError('Sélectionne un cours.'); return; }
    if (!current.service) { setError('Choisis un service.');   return; }
    if (!current.file)    { setError('Dépose un fichier.');    return; }
    setCart(p => [...p, { ...current, preview }]);
    setCurrent({ course: '', service: '', file: null });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFromCart = (idx) => setCart(p => { const n = p.filter((_, i) => i !== idx); if (!n.length) setStep('build'); return n; });

  /* ── Soumission finale ── */
  const submitAll = async (method) => {
    setSubmitting(true);
    setError('');
    try {
      for (const item of cart) {
        const fd = new FormData();
        fd.append('course_id', item.course);
        fd.append('service_id', item.service);
        fd.append('file', item.file);
        fd.append('payment_method', method);
        await assignmentAPI.create(fd);
      }
      navigate('/student/dashboard', {
        state: { message: `${cart.length} devoir${cart.length > 1 ? 's' : ''} soumis avec succès !` }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission. Réessaie.');
      setSubmitting(false);
    }
  };

  /* ── Helpers ── */
  const getCourse  = (id) => courses.find(c => String(c.id) === String(id));
  const getService = (id) => services.find(s => String(s.id) === String(id));
  const fileIcon   = (type) => type?.includes('pdf') ? '📄' : '📝';
  const cartTotal  = cart.reduce((s, item) => s + parseFloat(getService(item.service)?.price || 0), 0);

  const STEPS    = ['Composer le panier', 'Récapitulatif', 'Paiement'];
  const stepIdx  = { build: 0, review: 1, payment: 2 };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-600 font-semibold">Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white shadow-md border-b-2 border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => {
              if (step === 'payment') setStep('review');
              else if (step === 'review') setStep('build');
              else navigate('/student/dashboard');
            }} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition">
              <span className="text-xl">←</span>
              {step === 'payment' ? 'Retour au récap' : step === 'review' ? 'Retour au panier' : 'Tableau de bord'}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl flex items-center justify-center text-2xl">📖</div>
              <h1 className="text-xl font-black text-gray-800">Course<span className="font-light text-blue-600">Correct</span></h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Indicateur d'étapes ── */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => {
            const active = i === stepIdx[step];
            const done   = i < stepIdx[step];
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                  ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`font-bold text-sm hidden sm:inline ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                {i < STEPS.length - 1 && <span className="text-gray-300 mx-1">→</span>}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex gap-3 mb-6">
            <span>⚠️</span><span className="font-semibold">{error}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 1 — PANIER
        ══════════════════════════════════════════════════════ */}
        {step === 'build' && (
          <>
            {/* Mini-panier */}
            {cart.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-blue-800">🛒 Panier — {cart.length} devoir{cart.length > 1 ? 's' : ''}</h2>
                  <button onClick={() => setStep('review')} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                    Voir le récapitulatif →
                  </button>
                </div>
                <div className="space-y-2">
                  {cart.map((item, idx) => {
                    const c = getCourse(item.course); const s = getService(item.service);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-100">
                        <span>{c?.subject?.icon || '📚'}</span>
                        <span className="font-bold text-gray-800 text-sm">{c?.subject?.code}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600 text-sm">{s?.name}</span>
                        <span className="text-gray-500 text-sm truncate flex-1">· {item.preview?.name}</span>
                        <span className="font-black text-sm">${parseFloat(s?.price || 0).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-gray-800 mb-2">{cart.length === 0 ? 'Soumettre un devoir' : 'Ajouter un autre devoir'}</h1>
              <p className="text-gray-600">Sélectionne un cours, un service et dépose ton fichier.</p>
            </div>

            {/* 1 — Cours */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">1</div>
                <h2 className="text-2xl font-black text-gray-800">Choisir le cours</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <label key={course.id}
                    className={`relative p-5 border-2 rounded-2xl cursor-pointer transition hover:shadow-lg
                      ${current.course === String(course.id) ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input type="radio" name="course" value={course.id}
                      checked={current.course === String(course.id)}
                      onChange={e => { setCurrent(p => ({ ...p, course: e.target.value })); setError(''); }}
                      className="sr-only" />
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{course.subject?.icon || '📚'}</div>
                      <div>
                        <h3 className="font-black text-gray-800 mb-1">{course.subject?.code}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.subject?.name}</p>
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{course.semester}</span>
                      </div>
                    </div>
                    {current.course === String(course.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 2 — Service */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">2</div>
                <h2 className="text-2xl font-black text-gray-800">Choisir le service</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {services.map(service => (
                  <label key={service.id}
                    className={`relative p-6 border-2 rounded-3xl cursor-pointer transition hover:shadow-lg
                      ${service.is_premium
                        ? current.service === String(service.id) ? 'border-purple-600 bg-purple-50 shadow-xl' : 'border-purple-300 bg-purple-50 hover:border-purple-400'
                        : current.service === String(service.id) ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input type="radio" name="service" value={service.id}
                      checked={current.service === String(service.id)}
                      onChange={e => { setCurrent(p => ({ ...p, service: e.target.value })); setError(''); }}
                      className="sr-only" />
                    {service.is_premium && (
                      <div className="absolute -top-3 left-6">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">⭐ PREMIUM</span>
                      </div>
                    )}
                    <div className="text-4xl mb-3">{service.is_premium ? '⭐' : '📝'}</div>
                    <h3 className="text-xl font-black text-gray-800 mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500 text-sm">Prix</span>
                      <span className="text-2xl font-black text-gray-800">${parseFloat(service.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Délai</span>
                      <span className="font-bold text-gray-800">{Math.floor(service.turnaround_hours / 24)} jours</span>
                    </div>
                    {current.service === String(service.id) && (
                      <div className={`absolute top-5 right-5 w-7 h-7 ${service.is_premium ? 'bg-purple-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-sm`}>✓</div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 3 — Fichier */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">3</div>
                <h2 className="text-2xl font-black text-gray-800">Déposer le fichier</h2>
              </div>
              {!preview ? (
                <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition
                    ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                  <div className="text-6xl mb-4">📤</div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">{dragActive ? 'Dépose ici' : 'Déposer ton devoir'}</h3>
                  <p className="text-gray-600 mb-4">Glisse-dépose ou clique pour parcourir</p>
                  <p className="text-sm text-gray-500">PDF, DOC, DOCX · Max 10 Mo</p>
                </div>
              ) : (
                <div className="border-2 border-blue-200 bg-blue-50 rounded-3xl p-6 flex items-start gap-4">
                  <div className="text-5xl">{fileIcon(preview.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-gray-800 mb-1">{preview.name}</h3>
                    <p className="text-gray-600 text-sm">{preview.size} Mo</p>
                    <p className="text-blue-600 text-sm font-semibold mt-1">✓ Prêt à envoyer</p>
                  </div>
                  <button onClick={removeFile} className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition">✕</button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => navigate('/student/dashboard')} className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-2xl font-bold transition">Annuler</button>
              <button onClick={addToCart} className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition shadow-xl">+ Ajouter au panier</button>
              {cart.length > 0 && (
                <button onClick={() => setStep('review')} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black transition shadow-xl">
                  Voir récap ({cart.length}) →
                </button>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 2 — RÉCAPITULATIF
        ══════════════════════════════════════════════════════ */}
        {step === 'review' && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">📋</div>
              <h1 className="text-3xl font-black text-gray-800 mb-2">Récapitulatif</h1>
              <p className="text-gray-600">Vérifie ta commande avant de passer au paiement.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100 mb-6">
              <div className="space-y-4">
                {cart.map((item, idx) => {
                  const c = getCourse(item.course); const s = getService(item.service);
                  return (
                    <div key={idx} className="border-2 border-gray-100 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">{c?.subject?.icon || '📚'}</div>
                          <div>
                            <div className="font-black text-gray-800">{c?.subject?.code} — {c?.subject?.name}</div>
                            <div className="text-sm text-gray-500">{c?.semester}</div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 text-sm font-bold px-3 py-1 hover:bg-red-50 rounded-lg transition">Retirer</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wide">Service</div>
                          <div className="font-bold text-gray-800">{s?.name}</div>
                          <div className="text-sm text-gray-500">{Math.floor((s?.turnaround_hours || 0) / 24)} jours</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wide">Fichier</div>
                          <div className="font-bold text-gray-800 truncate">{fileIcon(item.preview?.type)} {item.preview?.name}</div>
                          <div className="text-sm text-gray-500">{item.preview?.size} Mo</div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span className="font-black text-lg text-gray-800">${parseFloat(s?.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t-2 border-gray-100 mt-6 pt-5 flex justify-between items-center">
                <span className="font-bold text-gray-600">{cart.length} devoir{cart.length > 1 ? 's' : ''}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-3xl font-black text-gray-800">${cartTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('build')} className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-2xl font-bold transition">← Modifier</button>
              <button onClick={() => { setPaymentMethod(null); setStep('payment'); }} disabled={cart.length === 0}
                className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition shadow-xl disabled:opacity-50">
                Choisir le paiement →
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            ÉTAPE 3 — PAIEMENT
        ══════════════════════════════════════════════════════ */}
        {step === 'payment' && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">💳</div>
              <h1 className="text-3xl font-black text-gray-800 mb-2">Mode de paiement</h1>
              <p className="text-gray-600">Total à régler : <span className="font-black text-blue-700 text-xl">${cartTotal.toFixed(2)}</span></p>
            </div>

            {/* Sélection méthode */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Carte */}
              <div onClick={() => setPaymentMethod('card')}
                className={`relative p-6 border-2 rounded-3xl cursor-pointer transition hover:shadow-xl
                  ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                {paymentMethod === 'card' && <div className="absolute top-4 right-4 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-black">✓</div>}
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-black text-gray-800 mb-1">Payer par carte</h3>
                <p className="text-gray-600 text-sm mb-4">Visa, Mastercard, American Express</p>
                <div className="flex gap-2 flex-wrap">
                  {['VISA', 'MC', 'AMEX'].map(b => <span key={b} style={{ background: '#E3F2FD', color: '#1565C0', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>{b}</span>)}
                  <span style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>🔒 Sécurisé</span>
                </div>
              </div>

              {/* Cash à la livraison */}
              <div onClick={() => setPaymentMethod('cash')}
                className={`relative p-6 border-2 rounded-3xl cursor-pointer transition hover:shadow-xl
                  ${paymentMethod === 'cash' ? 'border-green-600 bg-green-50 shadow-xl' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                {paymentMethod === 'cash' && <div className="absolute top-4 right-4 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-black">✓</div>}
                <div className="text-5xl mb-4">💵</div>
                <h3 className="text-xl font-black text-gray-800 mb-1">Cash à la livraison</h3>
                <p className="text-gray-600 text-sm mb-4">Tu paies en espèces quand tu reçois tes devoirs corrigés.</p>
                <span style={{ background: '#FFF8E1', color: '#E65100', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>⏳ Paiement à réception</span>
              </div>
            </div>

            {/* Formulaire carte */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-blue-100 mb-6">
                <h3 className="font-black text-gray-800 text-lg mb-6">💳 Informations de carte</h3>
                <CardForm cartTotal={cartTotal} submitting={submitting} onConfirm={() => submitAll('card')} />
              </div>
            )}

            {/* Cash à la livraison */}
            {paymentMethod === 'cash' && (
              <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-green-100 mb-6">
                <div className="flex gap-4 items-start mb-6">
                  <div className="text-4xl">🚚</div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg mb-1">Cash à la livraison</h3>
                    <p className="text-gray-600 text-sm">Tes devoirs sont soumis maintenant. Tu règles <strong>${cartTotal.toFixed(2)}</strong> en espèces lorsque tu reçois tes corrections.</p>
                  </div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
                  <div className="font-bold text-orange-800 text-sm mb-2">📌 Comment ça fonctionne</div>
                  <ul className="text-orange-700 text-sm space-y-1">
                    <li>✔ Tes devoirs sont envoyés aux tuteurs immédiatement</li>
                    <li>✔ Tu reçois une notification quand la correction est prête</li>
                    <li>💵 Tu paies ${cartTotal.toFixed(2)} en espèces à la réception des corrections</li>
                  </ul>
                </div>

                <button onClick={() => submitAll('cash')} disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl font-black text-lg transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting
                    ? <span className="flex items-center justify-center gap-3"><Spinner />Soumission en cours…</span>
                    : `✅ Confirmer — Payer à la livraison (${cart.length} devoir${cart.length > 1 ? 's' : ''})`}
                </button>
              </div>
            )}

            {!paymentMethod && (
              <div className="text-center text-gray-400 py-4 text-sm font-semibold">👆 Sélectionne une méthode ci-dessus</div>
            )}

            <button onClick={() => setStep('review')} className="w-full px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition mt-2">
              ← Retour au récapitulatif
            </button>
          </>
        )}
      </div>
    </div>
  );
}
