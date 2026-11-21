import TransactionManager from '../components/transactions/TransactionManager'

export default function Income() {
  return (
    <TransactionManager
      type="income"
      titleKey="nav.income"
      subtitleKey="income.subtitle"
    />
  )
}
