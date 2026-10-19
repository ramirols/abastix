import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const backendDir = path.join(rootDir, 'backend')

const isWindows = process.platform === 'win32'
const mvnCmd = isWindows ? 'mvnw.cmd' : './mvnw'
const fullMvnPath = path.join(backendDir, mvnCmd)

const extraArgs = process.argv.slice(2)
const args = extraArgs.length > 0 ? extraArgs : ['spring-boot:run']

console.log(`[abastix-backend] Iniciando backend Spring Boot con: ${mvnCmd} ${args.join(' ')}`)

const child = spawn(isWindows ? fullMvnPath : mvnCmd, args, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWindows,
})

child.on('error', (err) => {
  console.error('[abastix-backend] Error al ejecutar el backend:', err)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[abastix-backend] Proceso terminado con señal: ${signal}`)
  } else if (code !== 0 && code !== null) {
    console.error(`[abastix-backend] Proceso finalizó con código: ${code}`)
  }
  process.exit(code ?? 0)
})

const handleTermination = (signal) => {
  if (!child.killed) {
    child.kill(signal)
  }
}

process.on('SIGINT', () => handleTermination('SIGINT'))
process.on('SIGTERM', () => handleTermination('SIGTERM'))
