import React, { useState, useEffect, createContext, useContext } from 'react';

// ============= CONFIGURATION =============
const TEACHER_PASSWORD = 'ninja123';
const MANAGER_PASSWORD = 'admin456';
const MARGE_EQUILIBRAGE = 5;

// ============= CONTEXT =============
const AcademyContext = createContext();

const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) throw new Error('useAcademy must be inside AcademyProvider');
  return context;
};

// ============= PROVIDER =============
const AcademyProvider = ({ children }) => {
  const [students, setStudents] = useState([
    { id: '1', nom: 'Naruto', grade: 'Genin confirmé', classe: 'Classe A', dateInscription: '2026-05-15' },
    { id: '2', nom: 'Sasuke', grade: 'TKC', classe: 'Classe A', dateInscription: '2026-05-15' },
    { id: '3', nom: 'Sakura', grade: 'Genin', classe: 'Classe A', dateInscription: '2026-05-15' },
    { id: '4', nom: 'Kakashi', grade: 'Chunin', classe: 'Classe A', dateInscription: '2026-05-15' },
    { id: '5', nom: 'Obito', grade: 'Genin', classe: 'Classe A', dateInscription: '2026-05-16' },
    { id: '6', nom: 'Rin', grade: 'Genin', classe: 'Classe A', dateInscription: '2026-05-16' },
    { id: '7', nom: 'Minato', grade: 'TKC', classe: 'Classe A', dateInscription: '2026-05-16' },
    { id: '8', nom: 'Shikamaru', grade: 'Genin', classe: 'Classe B', dateInscription: '2026-05-15' },
    { id: '9', nom: 'Choji', grade: 'Genin', classe: 'Classe B', dateInscription: '2026-05-15' },
    { id: '10', nom: 'Ino', grade: 'Genin', classe: 'Classe B', dateInscription: '2026-05-15' },
    { id: '11', nom: 'Rock Lee', grade: 'Genin confirmé', classe: 'Classe B', dateInscription: '2026-05-16' },
    { id: '12', nom: 'Neji', grade: 'TKC', classe: 'Classe B', dateInscription: '2026-05-16' },
    { id: '13', nom: 'Hinata', grade: 'Genin', classe: 'Classe C', dateInscription: '2026-05-15' },
    { id: '14', nom: 'Kiba', grade: 'Genin', classe: 'Classe C', dateInscription: '2026-05-15' },
    { id: '15', nom: 'Shino', grade: 'Genin', classe: 'Classe C', dateInscription: '2026-05-16' }
  ]);
  const [points, setPoints] = useState([
    { id: '1', cycleId: '1', classe: 'Classe A', points: 10, motif: 'Excellent travail', enseignant: 'Kakashi', date: '2026-05-17' },
    { id: '2', cycleId: '1', classe: 'Classe B', points: 8, motif: 'Bonne concentration', enseignant: 'Kurenai', date: '2026-05-17' },
    { id: '3', cycleId: '1', classe: 'Classe C', points: 5, motif: 'Amélioration notable', enseignant: 'Asuma', date: '2026-05-17' },
    { id: '4', cycleId: '1', classe: 'Classe A', points: 12, motif: 'Stratégie gagnante', enseignant: 'Kakashi', date: '2026-05-18' }
  ]);
  const [cycles, setCycles] = useState([
    { id: '1', numero: 1, dateCreation: '2026-05-17', dateFermeture: null, status: 'ouvert', points: { 'Classe A': 22, 'Classe B': 8, 'Classe C': 5 }, gagnant: null, recompenses: '' }
  ]);
  const [currentCycleId, setCurrentCycleId] = useState('1');
  const [user, setUser] = useState(null);

  const calculerEquilibrage = () => {
    const nbA = students.filter(s => s.classe === 'Classe A').length;
    const nbB = students.filter(s => s.classe === 'Classe B').length;
    const nbC = students.filter(s => s.classe === 'Classe C').length;
    const max = Math.max(nbA, nbB, nbC);
    const min = Math.min(nbA, nbB, nbC);
    const ecart = max - min;
    const seuil = max - MARGE_EQUILIBRAGE;

    return {
      nbA, nbB, nbC, ecart,
      equilibre: ecart <= MARGE_EQUILIBRAGE,
      classeA: { nb: nbA, bloquee: (nbA > seuil) && (ecart > MARGE_EQUILIBRAGE) },
      classeB: { nb: nbB, bloquee: (nbB > seuil) && (ecart > MARGE_EQUILIBRAGE) },
      classeC: { nb: nbC, bloquee: (nbC > seuil) && (ecart > MARGE_EQUILIBRAGE) }
    };
  };

  const addStudent = (nom, grade, classe) => {
    const newStudent = { id: Date.now().toString(), nom, grade, classe, dateInscription: new Date().toISOString().split('T')[0] };
    setStudents([...students, newStudent]);
    return newStudent;
  };

  const deleteStudent = (studentId) => {
    setStudents(students.filter(s => s.id !== studentId));
  };

  const updateStudentGrade = (studentId, newGrade) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, grade: newGrade } : s));
  };

  const addPoints = (classe, pts, motif, enseignant) => {
    const newPoint = { id: Date.now().toString(), cycleId: currentCycleId, classe, points: pts, motif, enseignant, date: new Date().toISOString().split('T')[0] };
    setPoints([...points, newPoint]);
    setCycles(cycles.map(c => c.id === currentCycleId ? { ...c, points: { ...c.points, [classe]: (c.points[classe] || 0) + pts } } : c));
    return newPoint;
  };

  const deletePoints = (pointId) => {
    const point = points.find(p => p.id === pointId);
    if (point) {
      setPoints(points.filter(p => p.id !== pointId));
      setCycles(cycles.map(c => c.id === currentCycleId ? { ...c, points: { ...c.points, [point.classe]: (c.points[point.classe] || 0) - point.points } } : c));
    }
  };

  const startNewCycle = () => {
    const cycleNumber = cycles.length + 1;
    const newCycle = { id: Date.now().toString(), numero: cycleNumber, dateCreation: new Date().toISOString().split('T')[0], dateFermeture: null, status: 'ouvert', points: { 'Classe A': 0, 'Classe B': 0, 'Classe C': 0 }, gagnant: null, recompenses: '' };
    setCycles([...cycles, newCycle]);
    setCurrentCycleId(newCycle.id);
  };

  const closeCycle = () => {
    const currentCycle = cycles.find(c => c.id === currentCycleId);
    if (!currentCycle) return null;
    const pointsValues = Object.values(currentCycle.points);
    const winner = Object.keys(currentCycle.points).find(k => currentCycle.points[k] === Math.max(...pointsValues));
    const closedCycle = { ...currentCycle, dateFermeture: new Date().toISOString().split('T')[0], status: 'ferme', gagnant: winner };
    setCycles(cycles.map(c => c.id === currentCycleId ? closedCycle : c));
  };

  const updateCycleRewards = (cycleId, rewards) => {
    setCycles(cycles.map(c => c.id === cycleId ? { ...c, recompenses: rewards } : c));
  };

  const value = {
    students, points, cycles, currentCycleId, user, setUser,
    calculerEquilibrage, addStudent, deleteStudent, updateStudentGrade,
    addPoints, deletePoints, startNewCycle, closeCycle, updateCycleRewards,
    getPointsByClass: (classe) => points.filter(p => p.cycleId === currentCycleId && p.classe === classe),
    getStudentsByClass: (classe) => students.filter(s => s.classe === classe),
    getCurrentCycle: () => cycles.find(c => c.id === currentCycleId)
  };

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
};

// ============= PAGES =============
const Header = () => (
  <header style={{ background: '#7f1d1f', color: '#fffbeb', padding: '2rem', borderBottom: '4px solid #991b1f', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>学園 Akademia Ninja</h1>
    <p style={{ fontSize: '0.9rem', opacity: 0.9, fontStyle: 'italic' }}>La Grande Académie des Arts Ninjas</p>
  </header>
);

const Navigation = ({ currentPage, setCurrentPage, user }) => {
  const navItems = [
    { id: 'home', label: '🏠 Accueil', roles: ['student', 'teacher', 'manager', null] },
    { id: 'classes', label: '👥 Classes', roles: ['student', 'teacher', 'manager'] },
    { id: 'inscription', label: '✍️ S\'inscrire', roles: [null] },
    { id: 'login', label: '🔐 Se connecter', roles: [null] },
    { id: 'teacher', label: '📊 Enseignant', roles: ['teacher', 'manager'] },
    { id: 'manager', label: '⚙️ Gérant', roles: ['manager'] },
    { id: 'history', label: '📜 Historique', roles: ['teacher', 'manager'] },
    { id: 'logout', label: '🚪 Déconnexion', roles: ['student', 'teacher', 'manager'] }
  ];

  return (
    <nav style={{ background: '#fffbeb', borderBottom: '1px solid #991b1f', display: 'flex', gap: '1rem', padding: '0 2rem', overflowX: 'auto' }}>
      {navItems.filter(item => item.roles.includes(user?.role)).map(item => (
        <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{ background: 'none', border: 'none', padding: '1rem', fontWeight: '600', color: currentPage === item.id ? '#7f1d1f' : '#4b5563', borderBottom: currentPage === item.id ? '3px solid #7f1d1f' : 'none', backgroundColor: currentPage === item.id ? '#fee2e2' : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms' }}>
          {item.label}
        </button>
      ))}
    </nav>
  );
};

const HomePage = () => {
  const { cycles, currentCycleId } = useAcademy();
  const currentCycle = cycles.find(c => c.id === currentCycleId);

  if (!currentCycle) return <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', color: '#333' }}><h2 style={{ color: '#7f1d1f' }}>Chargement...</h2></div>;

  const ranking = [
    { name: 'Classe A', points: currentCycle.points['Classe A'] },
    { name: 'Classe B', points: currentCycle.points['Classe B'] },
    { name: 'Classe C', points: currentCycle.points['Classe C'] }
  ].sort((a, b) => b.points - a.points);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', color: '#333' }}>
      <h2 style={{ color: '#7f1d1f', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Bienvenue à l'Académie Ninja</h2>
      <div style={{ background: 'rgba(127,29,31,0.1)', border: '2px solid #991b1f', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.1rem', color: '#7f1d1f', lineHeight: 1.6 }}>Rejoins l'une de nos trois classes et concourir pour la gloire!</p>
      </div>

      <h3 style={{ color: '#7f1d1f', fontSize: '1.3rem', margin: '2rem 0 1rem' }}>🏆 Classement en direct</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {ranking.map((item, idx) => (
          <div key={item.name} style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'🥇🥈🥉'[idx]}</div>
            <p style={{ color: '#7f1d1f', fontWeight: '600', fontSize: '1.2rem' }}>{item.name}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#991b1f', marginTop: '0.5rem' }}>{item.points} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (selectedRole, pwd) => {
    const correctPwd = selectedRole === 'teacher' ? TEACHER_PASSWORD : MANAGER_PASSWORD;
    if (pwd === correctPwd) {
      onLogin({ role: selectedRole, name: selectedRole === 'teacher' ? 'Enseignant' : 'Gérant' });
    } else {
      setError('❌ Mot de passe incorrect');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto' }}>
      <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#7f1d1f', marginTop: 0 }}>Connexion Staff</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px', fontSize: '1rem' }}>
            <option value="">Choisir...</option>
            <option value="teacher">Enseignant</option>
            <option value="manager">Gérant</option>
          </select>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*****" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px', fontSize: '1rem' }} />
        </div>
        <button onClick={() => handleLogin(role, password)} disabled={!role} style={{ width: '100%', padding: '0.75rem', background: role ? '#7f1d1f' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: role ? 'pointer' : 'not-allowed' }}>
          Se connecter
        </button>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
          Ens: <code style={{ background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>ninja123</code><br/>Ger: <code style={{ background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>admin456</code>
        </p>
      </div>
    </div>
  );
};

const RegistrationPage = ({ onRegistered }) => {
  const { addStudent, calculerEquilibrage } = useAcademy();
  const [step, setStep] = useState(1);
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('Genin');
  const [classe, setClasse] = useState('');
  const [message, setMessage] = useState('');

  const handleStep1 = () => {
    if (nom && password.length >= 6) {
      setStep(2);
    } else {
      setMessage('❌ Nom et mdp (min 6) requis');
    }
  };

  const handleStep2 = () => {
    const equilibrage = calculerEquilibrage();
    if (!classe) {
      setMessage('❌ Choisissez une classe');
      return;
    }
    const classeBloquee = equilibrage[`classe${classe.split(' ')[1]}`]?.bloquee;
    if (classeBloquee) {
      setMessage(`❌ Classe ${classe} pleine`);
      return;
    }
    addStudent(nom, grade, classe);
    onRegistered({ nom, grade, classe });
    setMessage('✅ Inscription réussie!');
    setTimeout(() => setStep(1), 2000);
  };

  if (step === 1) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ color: '#7f1d1f', marginTop: 0 }}>Créer un compte</h2>
          {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Nom RP</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Naruto" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 caractères" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px', fontSize: '1rem' }} />
          </div>
          <button onClick={handleStep1} style={{ width: '100%', padding: '0.75rem', background: '#7f1d1f', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Continuer →</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const equilibrage = calculerEquilibrage();
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ color: '#7f1d1f', marginTop: 0 }}>Choisir une classe</h2>
          {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#7f1d1f', fontWeight: '600', marginBottom: '1rem' }}>Classe :</p>
            {['Classe A', 'Classe B', 'Classe C'].map(cls => {
              const letter = cls.split(' ')[1];
              const eqData = equilibrage[`classe${letter}`];
              const isBlocked = eqData?.bloquee;
              return (
                <button key={cls} onClick={() => setClasse(cls)} style={{ width: '100%', padding: '1rem', border: `2px solid ${isBlocked ? '#ef4444' : '#7f1d1f'}`, borderRadius: '4px', background: isBlocked ? '#fee2e2' : (classe === cls ? '#fef3c7' : 'white'), cursor: isBlocked ? 'not-allowed' : 'pointer', opacity: isBlocked ? 0.6 : 1, fontWeight: '600', color: '#7f1d1f', marginBottom: '0.5rem' }} disabled={isBlocked}>
                  {cls} ({eqData?.nb}) {isBlocked ? '❌' : '✅'}
                </button>
              );
            })}
          </div>
          <button onClick={handleStep2} style={{ width: '100%', padding: '0.75rem', background: '#7f1d1f', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>S'inscrire →</button>
          <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.75rem', background: 'white', color: '#7f1d1f', border: '2px solid #7f1d1f', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>← Retour</button>
        </div>
      </div>
    );
  }
};

const ClassesPage = () => {
  const { students, cycles, currentCycleId } = useAcademy();
  const currentCycle = cycles.find(c => c.id === currentCycleId);
  
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#7f1d1f', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Les trois classes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {['Classe A', 'Classe B', 'Classe C'].map(className => {
          const classStudents = students.filter(s => s.classe === className);
          const classPoints = currentCycle?.points[className] || 0;
          return (
            <div key={className} style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#7f1d1f', color: '#fffbeb', padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{className}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{classStudents.length} élève(s)</p>
              </div>
              <div style={{ background: '#fef3c7', padding: '1rem' }}>
                <p style={{ margin: 0, color: '#7f1d1f' }}>Points: <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1f' }}>{classPoints}</span></p>
              </div>
              <div style={{ padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {classStudents.length === 0 ? <p style={{ color: '#999' }}>Aucun élève</p> : classStudents.map(s => (
                  <div key={s.id} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#fef3c7', borderRadius: '4px', fontSize: '0.9rem', color: '#7f1d1f' }}>
                    <strong>{s.nom}</strong> <span style={{ background: '#fde68a', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem' }}>{s.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TeacherPage = () => {
  const { addPoints, points, cycles, currentCycleId, students, deletePoints, deleteStudent } = useAcademy();
  const [classe, setClasse] = useState('Classe A');
  const [pts, setPts] = useState('');
  const [motif, setMotif] = useState('');
  const [enseignant, setEnseignant] = useState('');
  const [message, setMessage] = useState('');

  const handleAddPoints = (e) => {
    e.preventDefault();
    if (classe && pts && motif && enseignant) {
      addPoints(classe, parseInt(pts), motif, enseignant);
      setMessage('✅ Points ajoutés!');
      setPts('');
      setMotif('');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const classHistory = points.filter(p => p.cycleId === currentCycleId && p.classe === classe);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#7f1d1f', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Tableau de bord Enseignant</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ background: '#7f1d1f', color: '#fffbeb', padding: '1rem', margin: '-1.5rem -1.5rem 1rem' }}>
            <h3 style={{ margin: 0 }}>Ajouter des points</h3>
          </div>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          <form onSubmit={handleAddPoints}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Classe</label>
              <select value={classe} onChange={(e) => setClasse(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px' }}>
                <option value="Classe A">Classe A</option>
                <option value="Classe B">Classe B</option>
                <option value="Classe C">Classe C</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Points</label>
              <input type="number" value={pts} onChange={(e) => setPts(e.target.value)} min="1" placeholder="Ex: 10" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Motif</label>
              <input type="text" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex: Bon travail" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7f1d1f', fontWeight: '600', marginBottom: '0.5rem' }}>Votre nom</label>
              <input type="text" value={enseignant} onChange={(e) => setEnseignant(e.target.value)} placeholder="Ex: Kakashi" style={{ width: '100%', padding: '0.75rem', border: '2px solid #7f1d1f', borderRadius: '4px' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#7f1d1f', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Ajouter</button>
          </form>
        </div>

        <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ background: '#7f1d1f', color: '#fffbeb', padding: '1rem', margin: '-1.5rem -1.5rem 1rem' }}>
            <h3 style={{ margin: 0 }}>Historique & Gestion</h3>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#7f1d1f', marginTop: 0 }}>Historique</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {classHistory.map(p => (
                <div key={p.id} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: '#fef3c7', borderRadius: '4px', fontSize: '0.9rem', color: '#7f1d1f' }}>
                  <strong>+{p.points}</strong> - {p.motif}
                  <button onClick={() => deletePoints(p.id)} style={{ float: 'right', background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}>Del</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#7f1d1f', marginTop: 0 }}>Élèves</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {students.map(s => (
                <div key={s.id} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: '#f0f0f0', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <strong>{s.nom}</strong> ({s.classe})<button onClick={() => deleteStudent(s.id)} style={{ float: 'right', background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}>Del</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerPage = () => {
  const { cycles, currentCycleId, startNewCycle, closeCycle } = useAcademy();
  const currentCycle = cycles.find(c => c.id === currentCycleId);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#7f1d1f', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Tableau de bord Gérant</h2>
      {currentCycle && (
        <div style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#7f1d1f', marginTop: 0 }}>Cycle {currentCycle.numero}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {['Classe A', 'Classe B', 'Classe C'].map(cls => (
              <div key={cls} style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '4px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: '#7f1d1f', fontWeight: '600', margin: 0 }}>{cls}</p>
                <p style={{ fontSize: '1.5rem', color: '#991b1f', fontWeight: 'bold', margin: '0.5rem 0 0' }}>{currentCycle.points[cls]}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { if (confirm('Fermer?')) { closeCycle(); alert('✅ Fermé!'); } }} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginRight: '1rem' }}>Fermer</button>
          <button onClick={() => { startNewCycle(); alert('✅ Nouveau!'); }} style={{ padding: '0.75rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Nouveau cycle</button>
        </div>
      )}
    </div>
  );
};

const HistoryPage = () => {
  const { cycles } = useAcademy();
  const closedCycles = cycles.filter(c => c.status === 'ferme');

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#7f1d1f', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>Historique</h2>
      {closedCycles.length === 0 ? <p>Aucun cycle fermé</p> : closedCycles.map(cycle => (
        <div key={cycle.id} style={{ background: 'white', border: '2px solid #7f1d1f', borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h3 style={{ color: '#7f1d1f' }}>Cycle {cycle.numero}</h3>
          {cycle.gagnant && <p>🏆 Gagnant: <strong>{cycle.gagnant}</strong></p>}
        </div>
      ))}
    </div>
  );
};

// ============= MAIN APP =============
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleRegistered = () => {
    setUser({ role: 'student' });
    setCurrentPage('home');
  };

  return (
    <AcademyProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fffbeb' }}>
        <Header />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />

        <main style={{ flex: 1, paddingBottom: '2rem' }}>
          {!user && currentPage === 'home' && <HomePage />}
          {!user && currentPage === 'inscription' && <RegistrationPage onRegistered={handleRegistered} />}
          {!user && currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
          {user && currentPage === 'home' && <HomePage />}
          {user && currentPage === 'classes' && <ClassesPage />}
          {(user?.role === 'teacher' || user?.role === 'manager') && currentPage === 'teacher' && <TeacherPage />}
          {user?.role === 'manager' && currentPage === 'manager' && <ManagerPage />}
          {(user?.role === 'teacher' || user?.role === 'manager') && currentPage === 'history' && <HistoryPage />}
          {user && currentPage === 'logout' && (
            <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
              <p style={{ color: '#7f1d1f', marginBottom: '1rem' }}>Déconnecté!</p>
              <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', background: '#7f1d1f', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Accueil</button>
            </div>
          )}
        </main>

        <footer style={{ background: '#7f1d1f', color: '#fffbeb', textAlign: 'center', padding: '1.5rem', borderTop: '4px solid #991b1f', fontStyle: 'italic' }}>
          「火の意志」- L'Esprit du Feu guide l'Académie Ninja
        </footer>
      </div>
    </AcademyProvider>
  );
}
