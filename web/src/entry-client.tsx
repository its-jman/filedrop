import './index.css'
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/dates/styles.layer.css'

import ReactDOM from 'react-dom/client'
import {App} from './app'

const rootElement = document.getElementById('app')!

const root = ReactDOM.createRoot(rootElement)
root.render(<App />)
