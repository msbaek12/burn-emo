import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to avoid TS error
  const env = loadEnv(mode, '.', '');

  // Vercel 빌드 로그에서 키 인식 여부 확인 (보안상 키 값은 출력하지 않음)
  if (mode === 'production') {
    if (env.API_KEY) {
      console.log('✅ API_KEY found in environment variables.');
    } else {
      console.warn('⚠️ API_KEY is MISSING in environment variables. The app will not work.');
    }
  }

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});