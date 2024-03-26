import './App.css'

import { memo } from 'react'

import { DrawAreas } from './components'

const App = memo(() => {
    return (
        <div className="app-container">
            <DrawAreas />
        </div>
    )
})

export default App
