import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './context/AuthContext'
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
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <div className="grid-bg" />
          <div className="noise" />
          <RouteTransition />
          <AnimatedRoutes />
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
