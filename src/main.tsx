import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <Tooltip.Provider delayDuration={300}>
        <App />
      </Tooltip.Provider>
    </MotionConfig>
  </React.StrictMode>,
)
