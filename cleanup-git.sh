#!/bin/bash
# Script para limpar arquivos indesejados do git tracking

echo "🧹 Limpando arquivos do git tracking..."

# Firebase
git rm --cached -r .firebaserc 2>/dev/null || true
git rm --cached -r firebase.json 2>/dev/null || true
git rm --cached -r .firebase/ 2>/dev/null || true
git rm --cached -r dataconnect/ 2>/dev/null || true

# Reference docs
git rm --cached bits.txt 2>/dev/null || true
git rm --cached shadcn-svelte.txt 2>/dev/null || true
git rm --cached referencias-tecnicas.txt 2>/dev/null || true
git rm --cached AGENTS.md 2>/dev/null || true
git rm --cached contexto.txt 2>/dev/null || true

# SpecKit & OpenCode
git rm --cached -r public/.specify/ 2>/dev/null || true
git rm --cached -r public/.opencode/ 2>/dev/null || true

# Misc
git rm --cached backup.zip 2>/dev/null || true
git rm --cached -r .gemini/ 2>/dev/null || true
git rm --cached public/.geminiignore 2>/dev/null || true

# Add .gitignore and commit
git add .gitignore

echo "✅ Limpeza concluída!"
echo ""
echo "📝 Execute os comandos abaixo:"
echo ""
echo "   git status"
echo "   git add .gitignore"
echo "   git commit -m 'chore: remove unwanted files from git tracking'"