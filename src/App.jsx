import React, { useState, useEffect, Suspense, lazy } from 'react';
import curriculumData from './data/curriculum.json';
import { StorageEngine } from './core/storage.js';
import { AudioEngine } from './core/audio.js';
import { NarrationEngine } from './core/narration.js';
import { fireChampagneConfetti } from './core/confetti.js';
import CertificateModal from './components/CertificateModal.jsx';
import GlossaryModal from './components/GlossaryModal.jsx';
import ClassroomSettingsModal from './components/ClassroomSettingsModal.jsx';
import DaylightHomePath from './daylight/DaylightHomePath.jsx';

const Station1LessonPlayer = lazy(() => import('./daylight/Station1LessonPlayer.jsx'));
const Station2RobotLesson = lazy(() => import('./daylight/Station2RobotLesson.jsx'));
const Station3TreeLesson = lazy(() => import('./daylight/Station3TreeLesson.jsx'));
const Station4PathfinderLesson = lazy(() => import('./daylight/Station4PathfinderLesson.jsx'));
const Station5KnnLesson = lazy(() => import('./daylight/Station5KnnLesson.jsx'));
const Station6VisionLesson = lazy(() => import('./daylight/Station6VisionLesson.jsx'));
const Station7NeuronLesson = lazy(() => import('./daylight/Station7NeuronLesson.jsx'));
const Station8LlmLesson = lazy(() => import('./daylight/Station8LlmLesson.jsx'));

const STATION_COMPONENTS = {
  lab1: Station1LessonPlayer,
  lab2: Station2RobotLesson,
  lab3: Station3TreeLesson,
  lab4: Station4PathfinderLesson,
  lab5: Station5KnnLesson,
  lab6: Station6VisionLesson,
  lab7: Station7NeuronLesson,
  lab8: Station8LlmLesson
};

export default function App() {
  const [activeLabId, setActiveLabId] = useState(() => StorageEngine.getState().activeLabId || 'lab1');
  const [viewMode, setViewMode] = useState(() => StorageEngine.getViewMode?.() || 'home');
  const [totalStars, setTotalStars] = useState(() => StorageEngine.getState().totalStars);
  const [labStars, setLabStars] = useState(() => StorageEngine.getState().labStars);

  // Modals state
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const unsubStorage = StorageEngine.subscribe((state) => {
      setTotalStars(state.totalStars);
      setLabStars((prevStars) => {
        if (state.labStars) {
          Object.entries(state.labStars).forEach(([labId, count]) => {
            if (count === 3 && (prevStars?.[labId] || 0) < 3) {
              AudioEngine.playSuccess?.();
              fireChampagneConfetti();
            }
          });
        }
        return state.labStars;
      });
      if (state.viewMode) setViewMode(state.viewMode);
      if (state.activeLabId) setActiveLabId(state.activeLabId);
    });
    return () => {
      unsubStorage();
    };
  }, []);

  const runViewTransition = (updateFn) => {
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition(() => {
          updateFn();
        });
        return;
      } catch {}
    }
    updateFn();
  };

  const handleLabSelect = (id) => {
    AudioEngine.playStep();
    NarrationEngine.stop?.();
    runViewTransition(() => {
      setActiveLabId(id);
      StorageEngine.setActiveLab(id);
      setViewMode('lab');
      StorageEngine.setViewMode('lab');
    });
  };

  const handleGoHome = () => {
    AudioEngine.playStep();
    NarrationEngine.stop?.();
    runViewTransition(() => {
      setViewMode('home');
      StorageEngine.setViewMode('home');
      if (typeof document !== 'undefined') {
        document.title = 'ZenLab | הרפתקת מדעי המחשב ובינה מלאכותית לילדים';
      }
    });
  };

  const handleOpenCertFromLesson = () => {
    NarrationEngine.stop?.();
    runViewTransition(() => {
      setViewMode('home');
      StorageEngine.setViewMode('home');
      setIsCertificateOpen(true);
    });
  };

  const ActiveStationComponent = STATION_COMPONENTS[activeLabId] || Station1LessonPlayer;

  return (
    <div className="min-h-screen bg-white text-[#3C3C3C]" dir="rtl">
      {viewMode === 'home' ? (
        <DaylightHomePath
          curriculum={curriculumData}
          labStars={labStars}
          totalStars={totalStars}
          onSelectLab={handleLabSelect}
          onOpenCertificate={() => setIsCertificateOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <Suspense
          fallback={
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
              <div className="px-6 py-4 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F5] text-sm font-extrabold text-[#777777]">
                טוען את השיעור...
              </div>
            </div>
          }
        >
          <ActiveStationComponent
            key={activeLabId}
            curriculum={curriculumData}
            onExit={handleGoHome}
            onNextStation={handleLabSelect}
            onOpenCertificate={handleOpenCertFromLesson}
          />
        </Suspense>
      )}

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        totalStars={totalStars}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        curriculum={curriculumData}
      />

      <ClassroomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />
    </div>
  );
}
