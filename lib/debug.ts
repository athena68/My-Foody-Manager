export const debug = {
  auth: (message: string, data?: any) => {
    console.log(`🔐 Auth [${new Date().toISOString()}]:`, message, data || "")
  },
  api: (message: string, data?: any) => {
    console.log(`🌐 API [${new Date().toISOString()}]:`, message, data || "")
  },
  error: (message: string, error: any) => {
    console.error(`❌ Error [${new Date().toISOString()}]:`, message, error)
  },
  supabase: (message: string, data?: any) => {
    console.log(`📦 Supabase [${new Date().toISOString()}]:`, message, data || "")
  },
  navigation: (message: string, data?: any) => {
    console.log(`🧭 Navigation [${new Date().toISOString()}]:`, message, data || "")
  },
}

