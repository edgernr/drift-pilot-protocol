import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './context/AuthContext'
import { AcademyProvider } from './context/AcademyContext'
import { CombatProvider } from './context/CombatContext'
import RouteTransition from './components/RouteTransition'
import ProtectedRoute from './components/ProtectedRoute'
import GateRoute from './components/GateRoute'
import HunterLayout from './components/HunterLayout'
import GameHUD from './components/GameHUD'
import Landing from './screens/Landing'
import Login from './screens/Login'
import Signup from './screens/Signup'
import Terms from './screens/Terms'
import Privacy from './screens/Privacy'
import Downloads from './screens/Downloads'
import Dashboard from './screens/Dashboard'
import Prologue from './screens/Prologue'
import Interlude1 from './screens/Interlude1'
import Interlude2 from './screens/Interlude2'
import SolverGate from './screens/SolverGate'
import RaidSolver from './screens/RaidSolver'
import Raid01 from './screens/Raid01'
// ASSOCIATION COMMAND — lazy so admin code never ships in the player chunk
const AdminCommand = lazy(() => import('./screens/AdminCommand'))
// GUILDS — lazy (own chunk)
const Guild = lazy(() => import('./screens/Guild'))
const GuildProfile = lazy(() => import('./screens/GuildProfile'))
import Quest from './screens/Quest'
import Quest2 from './screens/Quest2'
import Quest3 from './screens/Quest3'
import Quest4 from './screens/Quest4'
import Quest5 from './screens/Quest5'
import Quest6 from './screens/Quest6'
import Quest7 from './screens/Quest7'
import Quest8 from './screens/Quest8'
import Quest9 from './screens/Quest9'
import Quest10 from './screens/Quest10'
import PilotProfile from './screens/PilotProfile'
import AcademyLanding from './screens/AcademyLanding'
import AcademySignup from './screens/AcademySignup'
import AcademyOnboarding from './screens/AcademyOnboarding'
import AcademyDashboard from './screens/AcademyDashboard'
import GateS01 from './screens/GateS01'
import GateS02 from './screens/GateS02'
import GateS03 from './screens/GateS03'
import GateS04 from './screens/GateS04'
import GateS05 from './screens/GateS05'
import GateS06 from './screens/GateS06'
import GateS07 from './screens/GateS07'
import GateS08 from './screens/GateS08'
import GateS09 from './screens/GateS09'
import GateS10 from './screens/GateS10'
import GateS11 from './screens/GateS11'
import GateS12 from './screens/GateS12'
import GateS13 from './screens/GateS13'
import GateS14 from './screens/GateS14'
import GateS15 from './screens/GateS15'
import GateP01 from './screens/GateP01'
import GateP02 from './screens/GateP02'
import GateP03 from './screens/GateP03'
import GateP04 from './screens/GateP04'
import GateP05 from './screens/GateP05'
import GateP06 from './screens/GateP06'
import GateP07 from './screens/GateP07'
import GateP08 from './screens/GateP08'
import GateP09 from './screens/GateP09'
import GateP10 from './screens/GateP10'
import GateP11 from './screens/GateP11'
import GateP12 from './screens/GateP12'
import GateP13 from './screens/GateP13'
import GateP14 from './screens/GateP14'
import GateP15 from './screens/GateP15'
import GateJ01 from './screens/GateJ01'
import GateJ02 from './screens/GateJ02'
import GateJ03 from './screens/GateJ03'
import GateJ04 from './screens/GateJ04'
import GateJ05 from './screens/GateJ05'
import GateJ06 from './screens/GateJ06'
import GateJ07 from './screens/GateJ07'
import GateJ08 from './screens/GateJ08'
import GateJ09 from './screens/GateJ09'
import GateJ10 from './screens/GateJ10'
import GateP16 from './screens/GateP16'
import GateP17 from './screens/GateP17'
import GateP18 from './screens/GateP18'
import GateP19 from './screens/GateP19'
import GateP20 from './screens/GateP20'
import GateP21 from './screens/GateP21'
import GateP22 from './screens/GateP22'
import GateP23 from './screens/GateP23'
import GateP24 from './screens/GateP24'
import GateJ11 from './screens/GateJ11'
import GateJ12 from './screens/GateJ12'
import GateJ13 from './screens/GateJ13'
import GateJ14 from './screens/GateJ14'
import GateJ15 from './screens/GateJ15'
import GateJ16 from './screens/GateJ16'
import GateJ17 from './screens/GateJ17'
import GateJ18 from './screens/GateJ18'
import GateJ19 from './screens/GateJ19'
import GateJ20 from './screens/GateJ20'
import GateJ21 from './screens/GateJ21'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-screen">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><Suspense fallback={null}><AdminCommand /></Suspense></ProtectedRoute>} />
        <Route path="/prologue" element={<ProtectedRoute><Prologue /></ProtectedRoute>} />
        <Route path="/interlude1" element={<GateRoute requires={['act1-ch01']}><Interlude1 /></GateRoute>} />
        <Route path="/interlude2" element={<GateRoute requires={['act1-ch03']}><Interlude2 /></GateRoute>} />
        {/* Gate 01 has no prerequisites, but GateRoute (requires=[]) still applies
            the new-hunter prologue check — new accounts cannot URL-skip Zero Hour. */}
        <Route path="/quest" element={<GateRoute requires={[]}><Quest /></GateRoute>} />
        <Route path="/quest2" element={<GateRoute requires={['act1-ch01']}><Quest2 /></GateRoute>} />
        <Route path="/quest3" element={<GateRoute requires={['act1-ch01', 'act1-ch02']}><Quest3 /></GateRoute>} />
        <Route path="/quest4" element={<GateRoute requires={['act1-ch01', 'act1-ch02', 'act1-ch03']} unlockKey="act1-ch04"><Quest4 /></GateRoute>} />
        <Route path="/quest5" element={<GateRoute requires={['act1-ch04']} unlockKey="act1-ch05"><Quest5 /></GateRoute>} />
        <Route path="/quest6" element={<GateRoute requires={['act1-ch05']} unlockKey="act1-ch06"><Quest6 /></GateRoute>} />
        <Route path="/quest7" element={<GateRoute requires={['act1-ch06']} unlockKey="act1-ch07"><Quest7 /></GateRoute>} />
        <Route path="/quest8" element={<GateRoute requires={['act1-ch07']} unlockKey="act1-ch08"><Quest8 /></GateRoute>} />
        <Route path="/quest9" element={<GateRoute requires={['act1-ch08']} unlockKey="act1-ch09"><Quest9 /></GateRoute>} />
        <Route path="/quest10" element={<GateRoute requires={['act1-ch09']} unlockKey="act1-ch10"><Quest10 /></GateRoute>} />
        <Route path="/pilot/:id" element={<HunterLayout><PilotProfile /></HunterLayout>} />
        <Route path="/guild" element={<ProtectedRoute><Suspense fallback={null}><HunterLayout active="guild"><Guild /></HunterLayout></Suspense></ProtectedRoute>} />
        <Route path="/guild/:id" element={<Suspense fallback={null}><HunterLayout active="guild"><GuildProfile /></HunterLayout></Suspense>} />
        {/* Dev-only solver harness route (bible §9.6) — never registered in prod builds */}
        {import.meta.env.DEV && <Route path="/__solver/:gateNum" element={<SolverGate />} />}
        {import.meta.env.DEV && <Route path="/__raidsolver" element={<RaidSolver />} />}
        <Route path="/raid01" element={<ProtectedRoute><Raid01 /></ProtectedRoute>} />
        {/* Void Academy — hidden for Season 01 rework */}
        <Route path="/academy/*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AcademyProvider>
          <CombatProvider>
          <NavigationProvider>
            <div className="grid-bg" />
            <div className="noise" />
            <RouteTransition />
            <AnimatedRoutes />
            <GameHUD />
          </NavigationProvider>
          </CombatProvider>
        </AcademyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
