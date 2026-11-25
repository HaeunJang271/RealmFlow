import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rpcProxy } from './api/rpc'
export default defineConfig({ plugins: [react(), { name: 'gno-rpc-proxy', configureServer(server) { server.middlewares.use('/api/rpc', (req, res) => { void rpcProxy(req, res) }) } }] })
