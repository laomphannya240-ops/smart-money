import TransactionManager from '../components/transactions/TransactionManager'

export default function Expenses() {
  return (
    <TransactionManager
      type="expense"
      titleKey="nav.expenses"
      subtitleKey="expenses.subtitle"
    />
  )
}
