import TransactionManager from '../components/transactions/TransactionManager'

export default function Transactions() {
  return (
    <TransactionManager
      type="all"
      titleKey="trans.title"
      subtitleKey="trans.subtitle"
    />
  )
}
