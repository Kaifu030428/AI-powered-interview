import { RouterProvider } from 'react-router-dom'
import router from "./app.routes"
import { AuthProvider } from './features/auth/auth.context'
import { InterviewProvider } from './features/interview/Interview.context'

const App = () => {
  return (
    <>
    <AuthProvider>
      <InterviewProvider>
      <RouterProvider router={router}/>
      </InterviewProvider>
    </AuthProvider>
   
    </>
  )
}

export default App
