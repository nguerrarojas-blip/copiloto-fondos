/** Compositor de la app del postulante: resuelve qué pantalla mostrar según el
 * estado (enlace vencido → retomar → landing/piloto/levantamiento/entrega). */
import { useApp } from '../../state/AppContext';
import { Header } from './Chrome';
import { Landing } from './Landing';
import { Piloto } from './Piloto';
import { Levantamiento } from './Levantamiento';
import { Entrega } from './Entrega';
import { Resume, LinkExpired } from './Resume';

export function PostulanteApp() {
  const { state } = useApp();

  if (state.simLinkExpired && !state.showResume) return <LinkExpired />;
  if (state.showResume) {
    return (
      <>
        <Header />
        <Resume />
      </>
    );
  }

  return (
    <>
      <Header />
      {state.screen === 'landing' && <Landing />}
      {state.screen === 'piloto' && <Piloto />}
      {state.screen === 'levantamiento' && <Levantamiento />}
      {state.screen === 'entrega' && <Entrega />}
    </>
  );
}
