# Start-dev helper: installs dependencies and starts both backend and frontend
# Run this from the repository root in PowerShell

Write-Output "Bootstrapping project (installing root + server deps)..."
npm run bootstrap

Write-Output "Starting backend and frontend (concurrently)..."
npm run dev

Write-Output "If you need to stop: press Ctrl+C in this terminal."
