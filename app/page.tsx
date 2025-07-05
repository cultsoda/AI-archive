import { RootProvider } from '@/components/providers/RootProvider'
import DocumentArchivePage from '@/components/pages/DocumentArchivePage'

export default function Page() {
  return (
    <RootProvider>
      <DocumentArchivePage />
    </RootProvider>
  )
}