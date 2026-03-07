import HomePage from './components/HomePage.tsx';
import { BubbleBackground } from './components/BubbleBackground.tsx';

export default function App() {
  return (
    <BubbleBackground interactive>
      <HomePage />
    </BubbleBackground>
  );
}
