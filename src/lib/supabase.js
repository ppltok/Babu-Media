import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbnkhlxlxgrmrpmpeuwz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpibmtobHhseGdybXJwbXBldXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzU2NjYsImV4cCI6MjA4MDI1MTY2Nn0.Ztt0DbZcAFeBgdq1DkqIoC5gawLjUXg_5aWEZZ7lfA0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
