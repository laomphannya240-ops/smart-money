import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import AnimatedPage from '../components/common/AnimatedPage'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import { useI18n } from '../hooks/useI18n'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <AnimatedPage>
      <div className="card">
        <EmptyState
          icon={Compass}
          title={t('notfound.title')}
          description={t('notfound.description')}
          action={
            <Link to="/">
              <Button>{t('notfound.back')}</Button>
            </Link>
          }
        />
      </div>
    </AnimatedPage>
  )
}
