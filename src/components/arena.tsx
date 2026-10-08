import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, TrendingUp, Cpu, Flame, Check, CheckCheck, CircleDollarSign, Lightbulb, LoaderCircle, RotateCcw, Sparkles, ShieldCheck, Timer, X, Menu, AudioLines, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAiAssessment, getAiQuestions, testAiConnection } from '@/lib/arena-ai.functions';
import { emptyPitch, examplePitch, sharks, type Pitch, type Question, type Assessment, type SharkId } from '@/lib/arena-engine';

const sharkIcons = { business: BriefcaseBusiness, growth: TrendingUp, tech: Cpu, brutal: Flame };
type Screen = 'home' | 'pitch' | 'panel' | 'results';
type AiConnectionStatus = 'untested' | 'checking' | 'connected' | 'error';

function Fin({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M6 36C20 30 20 12 35 7C30 21 33 27 42 36H6Z" fill="currentColor"/><path d="M5 41H43" stroke="currentColor" strokeWidth="3"/></svg>;
}

function SharkMark({ id, large = false }: { id: SharkId; large?: boolean }) {
  const Icon = sharkIcons[id];
  return <div className={`shark-mark ${id} ${large ? 'large' : ''}`}><Icon strokeWidth={1.6}/></div>;
}

export function Arena() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pitch, setPitch] = useState<Pitch>(emptyPitch);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [menu, setMenu] = useState(false);
  const [improving, setImproving] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<AiConnectionStatus>('untested');
  const [aiConnectionError, setAiConnectionError] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (screen !== 'home') mainRef.current?.focus();
  }, [screen]);

  function go(next: Screen) { setScreen(next); setError(''); setMenu(false); }
  function reset() { setPitch(emptyPitch); setAnswers([]); setAssessment(null); setImproving(false); go('pitch'); }
  async function testAiService() {
    setAiConnectionStatus('checking');
    setAiConnectionError('');
    try {
      await testAiConnection();
      setAiConnectionStatus('connected');
    } catch (cause) {
      setAiConnectionStatus('error');
      setAiConnectionError(errorMessage(cause, 'Gemini connection test failed.'));
    }
  }
  async function start(event: FormEvent) {
    event.preventDefault();
    if (Object.values(pitch).some(value => value.trim().length < 3)) { setError('Give each field a little more detail—at least 3 characters.'); return; }
    setLoading(true); setError('');
    try {
      const generated = await getAiQuestions({ data: pitch });
      setAiConnectionStatus('connected');
      setAiConnectionError('');
      setQuestions(generated); setRound(0); setAnswers([]); setAnswer(''); setHint(false); go('panel');
    } catch (cause) { setAiConnectionStatus('error'); setAiConnectionError(errorMessage(cause, 'The AI panel couldn’t be prepared. Please try again.')); setError(errorMessage(cause, 'The AI panel couldn’t be prepared. Please try again.')); }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (answer.trim().split(/\s+/).length < 5) { setError('Give the investor at least 5 words to work with. Specifics make a stronger answer.'); return; }
    const nextAnswers = [...answers, answer.trim()];
    setError(''); setLoading(true);
    try {
      if (round < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnswers(nextAnswers); setRound(value => value + 1); setAnswer(''); setHint(false);
      } else {
        const result = await getAiAssessment({ data: { pitch, answers: nextAnswers } });
        setAiConnectionStatus('connected');
        setAiConnectionError('');
        setAnswers(nextAnswers); setAssessment(result); go('results');
      }
    } catch (cause) { setAiConnectionStatus('error'); setAiConnectionError(errorMessage(cause, 'The AI panel hit a snag. Your answer is still here—please retry.')); setError(errorMessage(cause, 'The AI panel hit a snag. Your answer is still here—please retry.')); }
    finally { setLoading(false); }
  }
  const currentQuestion = questions[round];
  const currentShark = sharks.find(shark => shark.id === currentQuestion?.shark);

  return <div className="arena-app">
    <header className="arena-header">
      <Button variant="ghost" className="brand" onClick={() => go('home')} aria-label="Shark Arena home"><Fin/><span>SHARK<span className="text-primary">ARENA</span></span></Button>
      <nav className={`header-nav ${menu ? 'is-open' : ''}`} aria-label="Main navigation">
        <Button variant="ghost" onClick={() => { go('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 30); }}>How it works</Button>
        <Button variant="ghost" onClick={() => { go('home'); setTimeout(() => document.getElementById('the-sharks')?.scrollIntoView({ behavior: 'smooth' }), 30); }}>Meet the sharks</Button>
        <span className={`demo-badge ai-service-status ${aiConnectionStatus}`} role="status" title={aiConnectionError || undefined}>
          <span/>{aiConnectionStatus === 'connected' ? 'GEMINI CONNECTED' : aiConnectionStatus === 'checking' ? 'CHECKING GEMINI' : aiConnectionStatus === 'error' ? 'GEMINI ERROR' : 'GEMINI NOT TESTED'}
        </span>
        <Button variant="ghost" className="ai-test-button" onClick={testAiService} disabled={aiConnectionStatus === 'checking'} aria-label="Test Gemini AI connection">
          {aiConnectionStatus === 'checking' ? <><LoaderCircle className="spin"/> Testing…</> : 'Test AI'}
        </Button>
      </nav>
      <Button variant="quiet" className="header-enter" onClick={() => go('pitch')}>Enter the Tank <ArrowUpRight/></Button>
      <Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu}>{menu ? <X/> : <Menu/>}</Button>
    </header>

    <main ref={mainRef} tabIndex={-1} className="arena-main">
      {screen === 'home' && <>
        <section className="arena-hero">
          <div className="arena-grid" aria-hidden="true"/><div className="arena-orbit orbit-one" aria-hidden="true"/><div className="arena-orbit orbit-two" aria-hidden="true"/>
          <div className="hero-content">
            <div className="challenge-tag"><span className="live-dot"/> PROMPTWARS <span className="tag-cross">×</span> THE PROMPT ARENA <span className="tag-divider"/> SHARK TANK SIMULATOR</div>
            <div className="hero-eyebrow"><span/> BIG IDEAS. TOUGH QUESTIONS. <span/></div>
            <h1>SHARK <span>ARENA<span className="title-dot">.</span></span></h1>
            <h2>Your idea is about to get grilled.</h2>
            <p>One pitch. Four ruthless investors. Zero sugarcoating.<br className="desktop-break"/> Find out if your startup has what it takes.</p>
            <Button variant="arena" className="hero-cta" onClick={() => go('pitch')}>Enter the Tank <ArrowUpRight/></Button>
            <div className="hero-reassurance"><ShieldCheck/> No sign-up. No stakes. Just honest feedback.</div>
            <div className="hero-stats"><div><strong>4</strong><span>INVESTOR PERSONALITIES</span></div><div><strong>~5 <small>min</small></strong><span>FROM PITCH TO VERDICT</span></div><div><strong>100<span className="text-primary">%</span></strong><span>BRUTALLY CONSTRUCTIVE</span></div></div>
          </div>
          <div className="hero-coordinate coordinate-left">ARENA_001 / READY</div><div className="hero-coordinate coordinate-right"><span className="live-dot"/> THE TANK IS OPEN</div>
        </section>
        <section className="sharks-section section-wrap" id="the-sharks">
          <div className="section-heading"><div><div className="eyebrow">YOUR NEXT TOUGHEST ROOM</div><h2>Meet the sharks<span className="text-primary">.</span></h2></div><p>Four perspectives. One pressure test.<br/>They’re not here to nod along.</p></div>
          <div className="shark-grid">{sharks.map((shark, index) => <article key={shark.id} className={`shark-card ${shark.id}`}><div className="shark-card-top"><SharkMark id={shark.id}/><span className="shark-number">0{index + 1}</span></div><div className="shark-label">{shark.label}</div><h3>{shark.name}</h3><p>{shark.description}</p><div className="shark-specialty">{shark.specialty}<ArrowUpRight/></div></article>)}</div>
        </section>
        <section className="how-section section-wrap" id="how-it-works"><div className="section-heading"><div><div className="eyebrow">THE PLAYBOOK</div><h2>A little pressure. A lot of clarity.</h2></div><Button variant="quiet" onClick={() => go('pitch')}>Let’s do this <ArrowRight/></Button></div><div className="steps-grid">{[{ title: 'Make your pitch', text: 'The problem, the solution, and how you’ll make money.', icon: Lightbulb }, { title: 'Face the panel', text: 'Answer one sharp question from each investor.', icon: AudioLines }, { title: 'Get your verdict', text: 'Your score, your weak spots, and your next move.', icon: Target }].map((step, index) => <div className="how-step" key={step.title}><span className="step-number">0{index + 1}</span><step.icon/><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
        <section className="closing-section"><Fin/><h2>Big idea? Bring it.</h2><Button variant="arena" onClick={() => go('pitch')}>Enter the Tank <ArrowUpRight/></Button></section>
      </>}

      {screen === 'pitch' && <section className="flow-wrap">
        <FlowSteps active={0}/>
        <div className="flow-heading"><div className="eyebrow">THE FLOOR IS YOURS</div><h1>{improving ? 'Come back stronger.' : 'Make your pitch.'}</h1><p>{improving ? 'Sharpen your idea using the panel’s feedback, then face them again.' : 'Keep it clear. Keep it real. The sharks are listening.'}</p></div>
        {improving && assessment && <div className="feedback-callout"><Lightbulb/><div><strong>Your priority</strong><p>{assessment.weakness}</p></div></div>}
        <form className="pitch-form" onSubmit={start}>
          <div className="form-top"><span><Fin/> YOUR STARTUP</span><Button type="button" variant="quiet" size="sm" onClick={() => { setPitch(examplePitch); setError(''); }}><Sparkles/> Try an example idea</Button></div>
          <Field label="Startup name" number="01" htmlFor="name"><Input id="name" required maxLength={80} value={pitch.name} onChange={event => setPitch({ ...pitch, name: event.target.value })} placeholder="The next big thing has a name…"/></Field>
          <div className="form-columns"><Field label="What problem are you solving?" number="02" htmlFor="problem"><Textarea id="problem" required maxLength={1500} value={pitch.problem} onChange={event => setPitch({ ...pitch, problem: event.target.value })} placeholder="Who is struggling, and what isn’t working for them?"/></Field><Field label="What’s your solution?" number="03" htmlFor="solution"><Textarea id="solution" required maxLength={1500} value={pitch.solution} onChange={event => setPitch({ ...pitch, solution: event.target.value })} placeholder="What are you building, and how does it solve the problem?"/></Field></div>
          <Field label="Who are your target customers?" number="04" htmlFor="customers"><Textarea id="customers" required maxLength={1500} value={pitch.customers} onChange={event => setPitch({ ...pitch, customers: event.target.value })} placeholder="Be specific. ‘Everyone’ is not a target market."/></Field>
          <Field label="How will you make money?" number="05" htmlFor="model"><Textarea id="model" required maxLength={1500} value={pitch.model} onChange={event => setPitch({ ...pitch, model: event.target.value })} placeholder="Pricing, revenue streams, costs—give us the business model."/></Field>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-bottom"><span><ShieldCheck/> Your pitch and answers are sent to Google Gemini for AI feedback.</span><Button variant="arena" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin"/> Assembling the panel…</> : <>Face the sharks <ArrowRight/></>}</Button></div>
        </form>
      </section>}

      {screen === 'panel' && currentQuestion && currentShark && <section className="flow-wrap panel-wrap">
        <FlowSteps active={1}/>
        <div className="panel-heading"><div><div className="eyebrow">LIVE IN THE TANK</div><h1>{pitch.name}</h1></div><div className="round-pill"><span className="live-dot"/> ROUND {round + 1} / 4</div></div>
        <div className="panel-investors">{sharks.map((shark, i) => <div className={`panel-persona ${shark.id} ${round === i ? 'selected' : ''} ${round > i ? 'complete' : ''}`} key={shark.id}><SharkMark id={shark.id}/><span>{shark.short} Shark</span>{round > i && <Check/>}</div>)}</div>
        <div className="round-progress" role="progressbar" aria-label="Panel progress" aria-valuenow={round} aria-valuemin={0} aria-valuemax={4}>{sharks.map((shark, i) => <span key={shark.id} className={i <= round ? 'filled' : ''}/>)}</div>
        <div className={`question-panel ${currentShark.id}`} key={round}><div className="question-persona"><SharkMark id={currentShark.id} large/><div><span className="shark-label">{currentShark.label}</span><h2>{currentShark.name}</h2><p>{currentShark.focus}</p></div><div className="visual-timer" aria-label="Untimed practice round"><Timer/><span>TAKE YOUR TIME</span></div></div><div className="question-text"><span className="quote-mark">“</span><h3>{currentQuestion.question}</h3></div></div>
        <form className="answer-form" onSubmit={submit}><div className="answer-label"><label htmlFor="answer">Your response</label><span>The floor is yours.</span></div><Textarea id="answer" autoFocus key={`answer-${round}`} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Make your case. Concrete numbers and honest assumptions go a long way." maxLength={3000} required disabled={loading}/><div className="answer-counter">{answer.length} / 3,000</div>
          {hint && <div className="hint-box"><Lightbulb/><p>{currentQuestion.hint}</p></div>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="answer-actions"><Button type="button" variant="quiet" onClick={() => setHint(!hint)} aria-expanded={hint}><Lightbulb/>{hint ? 'Hide hint' : 'Give me a hint'}</Button><Button type="submit" variant="arena" disabled={loading}>{loading ? <><LoaderCircle className="spin"/>{round === 3 ? 'The sharks are deliberating…' : 'Investor is considering…'}</> : <>{round === 3 ? 'Get my verdict' : 'Submit answer'}<ArrowRight/></>}</Button></div>
        </form><p className="panel-note"><ShieldCheck/> Practice round · No time limit · Simulated investor questions</p>
      </section>}

      {screen === 'results' && assessment && <section className="results-wrap section-wrap"><FlowSteps active={2}/><div className="results-heading"><div><div className="eyebrow">THE SHARKS HAVE SPOKEN</div><h1>The verdict is in<span className="text-primary">.</span></h1><p>{pitch.name} · Here’s where you stand, and where to go next.</p></div><div className="simulation-label"><ShieldCheck/> SIMULATED ASSESSMENT</div></div>
        <div className="score-dashboard"><div className="overall-score"><div className="score-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle className="score-track" cx="100" cy="100" r="86"/><circle className="score-fill" cx="100" cy="100" r="86" strokeDasharray={`${assessment.overall * 5.4035} 540.35`}/></svg><div><strong>{assessment.overall}</strong><span>/ 100</span></div></div><h2>Overall Pitch Score</h2><p>{assessment.overall >= 75 ? 'Promising. Now prove it.' : assessment.overall >= 55 ? 'Potential worth pressure-testing.' : 'An early idea. More evidence needed.'}</p></div><div className="category-scores"><div className="eyebrow">UNDER THE MICROSCOPE</div>{assessment.categories.map(category => <div className="category-row" key={category.name}><div><span>{category.name}</span><strong>{category.score}<small> / 100</small></strong></div><meter min={0} max={100} value={category.score} aria-label={`${category.name} score`}/></div>)}</div></div>
        <div className="assessment-grid"><section className="assessment-block"><div className="assessment-title"><CheckCheck/><h2>What’s working</h2></div>{assessment.strengths.map(text => <p className="strength-item" key={text}><Check/>{text}</p>)}</section><section className="assessment-block weakness-block"><div className="assessment-title"><Target/><h2>Your biggest weakness</h2></div><p>{assessment.weakness}</p></section></div>
        <section className="verdict-section"><div className="section-heading"><div><div className="eyebrow">MONEY TALKS</div><h2>Who’s in. Who’s out.</h2></div><span className="verdict-count">{assessment.verdicts.filter(v => v.invests).length} of 4 sharks interested</span></div><div className="shark-grid">{assessment.verdicts.map(verdict => { const shark = sharks.find(s => s.id === verdict.shark); return <article className={`shark-card verdict-card ${verdict.shark}`} key={verdict.shark}><SharkMark id={verdict.shark}/><h3>{shark?.name}</h3><span className={`verdict-badge ${verdict.invests ? 'in' : 'out'}`}>{verdict.invests ? <Check/> : <X/>}{verdict.invests ? 'I’M IN — FOR A PILOT' : 'I’M OUT — FOR NOW'}</span><p>{verdict.reason}</p></article>; })}</div></section>
        <section className="offer-section"><div className="offer-icon"><CircleDollarSign/></div><div className="offer-content"><div className="eyebrow">HYPOTHETICAL OFFER</div><h2>{assessment.offer ? <>£{assessment.offer.amount.toLocaleString('en-GB')} <span>for {assessment.offer.equity}% equity</span></> : 'No offer. Not the end.'}</h2><p>{assessment.offer ? 'An illustrative combined panel offer, conditional on proving your assumptions.' : 'The panel needs more evidence before making a hypothetical investment.'}</p><span className="offer-disclaimer">Simulation only. No real investment, financial advice, or binding commitment.</span></div></section>
        <section className="next-section"><div className="eyebrow">YOUR NEXT MOVE</div><h2>Turn the feedback into traction.</h2><div className="next-steps">{assessment.improvements.map((text, i) => <div key={text}><span>0{i + 1}</span><p>{text}</p><ChevronRight/></div>)}</div></section>
        <div className="results-actions"><Button variant="quiet" onClick={reset}><RotateCcw/> Pitch Again</Button><Button variant="arena" onClick={() => { setImproving(true); go('pitch'); }}><Sparkles/> Improve My Pitch <ArrowRight/></Button></div>
      </section>}
    </main>
    <footer className="arena-footer"><div className="footer-brand"><Fin/> SHARK ARENA <span>Built for the bold.</span></div><p>AI-generated feedback and hypothetical offers are not real investment decisions or financial advice. Pitch content is processed by Google Gemini.</p><span className="footer-challenge">PROMPTWARS × THE PROMPT ARENA <ArrowUpRight/></span></footer>
  </div>;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function FlowSteps({ active }: { active: number }) {
  return <div className="flow-steps" aria-label="Pitch stages">{['Your pitch', 'The grilling', 'The verdict'].map((name, i) => <div className={i <= active ? 'active' : ''} aria-current={i === active ? 'step' : undefined} key={name}><span>{i < active ? <Check/> : `0${i + 1}`}</span>{name}{i < 2 && <ArrowRight/>}</div>)}</div>;
}
function Field({ label, number, htmlFor, children }: { label: string; number: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="form-field"><label htmlFor={htmlFor}><span>{number}</span>{label}</label>{children}</div>;
}