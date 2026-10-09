import './TutorTyping.css';
export default function TutorTyping() {
  return <article className="tutor-typing" role="status" aria-label="Tutor pisze…"><strong>Tutor</strong><span className="tutor-typing-dots" aria-hidden="true"><i/><i/><i/></span><span className="sr-only">Tutor pisze…</span></article>;
}