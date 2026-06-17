import { createRoot } from 'react-dom/client';
import VideoTemplate from './components/video/VideoTemplate';
import './video-index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<VideoTemplate />);
