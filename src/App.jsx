import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './context/AuthContext'
import { AcademyProvider } from './context/AcademyContext'
import RouteTransition from './components/RouteTransition'
import ProtectedRoute from './components/ProtectedRoute'
import GateRoute from './components/GateRoute'
import Landing from './screens/Landing'
import Login from './screens/Login'
import Signup from './screens/Signup'
import Dashboard from './screens/Dashboard'
import Quest from './screens/Quest'
import Quest2 from './screens/Quest2'
import Quest3 from './screens/Quest3'
import Quest4 from './screens/Quest4'
import Quest5 from './screens/Quest5'
import Quest6 from './screens/Quest6'
import Quest7 from './screens/Quest7'
import Quest8 from './screens/Quest8'
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/quest" element={<ProtectedRoute><Quest /></ProtectedRoute>} />
        <Route path="/quest2" element={<GateRoute requires={['act1-ch01']}><Quest2 /></GateRoute>} />
        <Route path="/quest3" element={<GateRoute requires={['act1-ch01', 'act1-ch02']}><Quest3 /></GateRoute>} />
        <Route path="/quest4" element={<GateRoute requires={['act1-ch01', 'act1-ch02', 'act1-ch03']} unlockKey="act1-ch04"><Quest4 /></GateRoute>} />
        <Route path="/quest5" element={<GateRoute requires={['act1-ch04']} unlockKey="act1-ch05"><Quest5 /></GateRoute>} />
        <Route path="/quest6" element={<GateRoute requires={['act1-ch05']} unlockKey="act1-ch06"><Quest6 /></GateRoute>} />
        <Route path="/quest7" element={<GateRoute requires={['act1-ch06']} unlockKey="act1-ch07"><Quest7 /></GateRoute>} />
        <Route path="/quest8" element={<GateRoute requires={['act1-ch07']} unlockKey="act1-ch08"><Quest8 /></GateRoute>} />
        <Route path="/pilot/:id" element={<PilotProfile />} />
        {/* Drift Builders Academy */}
        <Route path="/academy" element={<AcademyLanding />} />
        <Route path="/academy/signup" element={<AcademySignup />} />
        <Route path="/academy/onboarding" element={<ProtectedRoute><AcademyOnboarding /></ProtectedRoute>} />
        <Route path="/academy/dashboard" element={<ProtectedRoute><AcademyDashboard /></ProtectedRoute>} />
        <Route path="/academy/gate/s01" element={<ProtectedRoute><GateS01 /></ProtectedRoute>} />
        <Route path="/academy/gate/s02" element={<ProtectedRoute><GateS02 /></ProtectedRoute>} />
        <Route path="/academy/gate/s03" element={<ProtectedRoute><GateS03 /></ProtectedRoute>} />
        <Route path="/academy/gate/s04" element={<ProtectedRoute><GateS04 /></ProtectedRoute>} />
        <Route path="/academy/gate/s05" element={<ProtectedRoute><GateS05 /></ProtectedRoute>} />
        <Route path="/academy/gate/s06" element={<ProtectedRoute><GateS06 /></ProtectedRoute>} />
        <Route path="/academy/gate/s07" element={<ProtectedRoute><GateS07 /></ProtectedRoute>} />
        <Route path="/academy/gate/s08" element={<ProtectedRoute><GateS08 /></ProtectedRoute>} />
        <Route path="/academy/gate/s09" element={<ProtectedRoute><GateS09 /></ProtectedRoute>} />
        <Route path="/academy/gate/s10" element={<ProtectedRoute><GateS10 /></ProtectedRoute>} />
        <Route path="/academy/gate/s11" element={<ProtectedRoute><GateS11 /></ProtectedRoute>} />
        <Route path="/academy/gate/s12" element={<ProtectedRoute><GateS12 /></ProtectedRoute>} />
        <Route path="/academy/gate/s13" element={<ProtectedRoute><GateS13 /></ProtectedRoute>} />
        <Route path="/academy/gate/s14" element={<ProtectedRoute><GateS14 /></ProtectedRoute>} />
        <Route path="/academy/gate/s15" element={<ProtectedRoute><GateS15 /></ProtectedRoute>} />
        <Route path="/academy/gate/p01" element={<ProtectedRoute><GateP01 /></ProtectedRoute>} />
        <Route path="/academy/gate/p02" element={<ProtectedRoute><GateP02 /></ProtectedRoute>} />
        <Route path="/academy/gate/p03" element={<ProtectedRoute><GateP03 /></ProtectedRoute>} />
        <Route path="/academy/gate/p04" element={<ProtectedRoute><GateP04 /></ProtectedRoute>} />
        <Route path="/academy/gate/p05" element={<ProtectedRoute><GateP05 /></ProtectedRoute>} />
        <Route path="/academy/gate/p06" element={<ProtectedRoute><GateP06 /></ProtectedRoute>} />
        <Route path="/academy/gate/p07" element={<ProtectedRoute><GateP07 /></ProtectedRoute>} />
        <Route path="/academy/gate/p08" element={<ProtectedRoute><GateP08 /></ProtectedRoute>} />
        <Route path="/academy/gate/p09" element={<ProtectedRoute><GateP09 /></ProtectedRoute>} />
        <Route path="/academy/gate/p10" element={<ProtectedRoute><GateP10 /></ProtectedRoute>} />
        <Route path="/academy/gate/p11" element={<ProtectedRoute><GateP11 /></ProtectedRoute>} />
        <Route path="/academy/gate/p12" element={<ProtectedRoute><GateP12 /></ProtectedRoute>} />
        <Route path="/academy/gate/p13" element={<ProtectedRoute><GateP13 /></ProtectedRoute>} />
        <Route path="/academy/gate/p14" element={<ProtectedRoute><GateP14 /></ProtectedRoute>} />
        <Route path="/academy/gate/p15" element={<ProtectedRoute><GateP15 /></ProtectedRoute>} />
        <Route path="/academy/gate/j01" element={<ProtectedRoute><GateJ01 /></ProtectedRoute>} />
        <Route path="/academy/gate/j02" element={<ProtectedRoute><GateJ02 /></ProtectedRoute>} />
        <Route path="/academy/gate/j03" element={<ProtectedRoute><GateJ03 /></ProtectedRoute>} />
        <Route path="/academy/gate/j04" element={<ProtectedRoute><GateJ04 /></ProtectedRoute>} />
        <Route path="/academy/gate/j05" element={<ProtectedRoute><GateJ05 /></ProtectedRoute>} />
        <Route path="/academy/gate/j06" element={<ProtectedRoute><GateJ06 /></ProtectedRoute>} />
        <Route path="/academy/gate/j07" element={<ProtectedRoute><GateJ07 /></ProtectedRoute>} />
        <Route path="/academy/gate/j08" element={<ProtectedRoute><GateJ08 /></ProtectedRoute>} />
        <Route path="/academy/gate/j09" element={<ProtectedRoute><GateJ09 /></ProtectedRoute>} />
        <Route path="/academy/gate/j10" element={<ProtectedRoute><GateJ10 /></ProtectedRoute>} />
        <Route path="/academy/gate/p16" element={<ProtectedRoute><GateP16 /></ProtectedRoute>} />
        <Route path="/academy/gate/p17" element={<ProtectedRoute><GateP17 /></ProtectedRoute>} />
        <Route path="/academy/gate/p18" element={<ProtectedRoute><GateP18 /></ProtectedRoute>} />
        <Route path="/academy/gate/p19" element={<ProtectedRoute><GateP19 /></ProtectedRoute>} />
        <Route path="/academy/gate/p20" element={<ProtectedRoute><GateP20 /></ProtectedRoute>} />
        <Route path="/academy/gate/p21" element={<ProtectedRoute><GateP21 /></ProtectedRoute>} />
        <Route path="/academy/gate/p22" element={<ProtectedRoute><GateP22 /></ProtectedRoute>} />
        <Route path="/academy/gate/p23" element={<ProtectedRoute><GateP23 /></ProtectedRoute>} />
        <Route path="/academy/gate/p24" element={<ProtectedRoute><GateP24 /></ProtectedRoute>} />
        <Route path="/academy/gate/j11" element={<ProtectedRoute><GateJ11 /></ProtectedRoute>} />
        <Route path="/academy/gate/j12" element={<ProtectedRoute><GateJ12 /></ProtectedRoute>} />
        <Route path="/academy/gate/j13" element={<ProtectedRoute><GateJ13 /></ProtectedRoute>} />
        <Route path="/academy/gate/j14" element={<ProtectedRoute><GateJ14 /></ProtectedRoute>} />
        <Route path="/academy/gate/j15" element={<ProtectedRoute><GateJ15 /></ProtectedRoute>} />
        <Route path="/academy/gate/j16" element={<ProtectedRoute><GateJ16 /></ProtectedRoute>} />
        <Route path="/academy/gate/j17" element={<ProtectedRoute><GateJ17 /></ProtectedRoute>} />
        <Route path="/academy/gate/j18" element={<ProtectedRoute><GateJ18 /></ProtectedRoute>} />
        <Route path="/academy/gate/j19" element={<ProtectedRoute><GateJ19 /></ProtectedRoute>} />
        <Route path="/academy/gate/j20" element={<ProtectedRoute><GateJ20 /></ProtectedRoute>} />
        <Route path="/academy/gate/j21" element={<ProtectedRoute><GateJ21 /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AcademyProvider>
          <NavigationProvider>
            <div className="grid-bg" />
            <div className="noise" />
            <RouteTransition />
            <AnimatedRoutes />
          </NavigationProvider>
        </AcademyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
