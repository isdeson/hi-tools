import 'tdesign-react/es/style/index.css'
import '@/styles/index.scss'
import dayjs from 'dayjs'
import PluginLunar from 'dayjs-plugin-lunar'
import 'dayjs/locale/zh-cn'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

dayjs.extend(PluginLunar)
dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
