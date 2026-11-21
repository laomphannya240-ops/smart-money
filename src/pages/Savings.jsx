import { useState } from 'react'
import { CheckCircle2, PiggyBank, Plus, Target, TrendingUp } from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useI18n } from '../hooks/useI18n'
import { useConfirm } from '../hooks/useConfirm'
import { goalCurrent } from '../utils/finance'
import AnimatedPage from '../components/common/AnimatedPage'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SavingsGoalCard from '../components/savings/SavingsGoalCard'
import SavingsGoalForm from '../components/savings/SavingsGoalForm'
import ContributionModal from '../components/savings/ContributionModal'

export default function Savings() {
  const { savingsGoals, overallTotals, deleteGoal } = useFinance()
  const { t, formatMoney } = useI18n()
  const { confirm } = useConfirm()

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [contributionGoal, setContributionGoal] = useState(null)

  const currentAmounts = savingsGoals.map((goal) => goalCurrent(goal))
  const completed = currentAmounts.filter((amount, index) => amount >= savingsGoals[index].target).length
  const averageProgress = savingsGoals.length
    ? currentAmounts.reduce((total, amount, index) => {
        const target = savingsGoals[index].target
        return total + (target > 0 ? Math.min(100, (amount / target) * 100) : 0)
      }, 0) / savingsGoals.length
    : 0

  const handleDelete = async (goal) => {
    const confirmed = await confirm({
      title: t('savings.deleteGoal'),
      message: `${goal.name} — ${t('confirm.deleteMessage')}`,
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    })
    if (confirmed) deleteGoal(goal.id)
  }

  return (
    <AnimatedPage>
      <PageHeader
        title={t('nav.savings')}
        subtitle={t('savings.subtitle')}
        actions={
          <Button icon={Plus} onClick={() => setFormOpen(true)}>{t('savings.addGoal')}</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('savings.totalSaved')} value={formatMoney(overallTotals.totalSavings)} icon={PiggyBank} tone="violet" />
        <StatCard index={1} label={t('savings.activeGoals')} value={String(savingsGoals.length - completed)} icon={Target} tone="blue" />
        <StatCard index={2} label={t('savings.completed')} value={String(completed)} icon={CheckCircle2} tone="green" />
        <StatCard index={3} label={t('savings.averageProgress')} value={`${averageProgress.toFixed(0)}%`} icon={TrendingUp} tone="amber" />
      </div>

      {savingsGoals.length === 0 ? (
        <div className="card mt-5">
          <EmptyState
            icon={PiggyBank}
            title={t('savings.empty')}
            description={t('savings.emptyDesc')}
            action={<Button icon={Plus} onClick={() => setFormOpen(true)}>{t('savings.createGoal')}</Button>}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savingsGoals.map((goal, index) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onAddMoney={setContributionGoal}
              onEdit={setEditingGoal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('savings.addGoal')}
        subtitle={t('savings.emptyDesc')}
      >
        <SavingsGoalForm onSuccess={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
      </Modal>

      <Modal
        open={Boolean(editingGoal)}
        onClose={() => setEditingGoal(null)}
        title={t('savings.editGoal')}
      >
        {editingGoal && (
          <SavingsGoalForm
            initial={editingGoal}
            onSuccess={() => setEditingGoal(null)}
            onCancel={() => setEditingGoal(null)}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(contributionGoal)}
        onClose={() => setContributionGoal(null)}
        title={t('savings.contribute')}
        size="sm"
      >
        {contributionGoal && (
          <ContributionModal
            goal={contributionGoal}
            onSuccess={() => setContributionGoal(null)}
            onCancel={() => setContributionGoal(null)}
          />
        )}
      </Modal>
    </AnimatedPage>
  )
}
