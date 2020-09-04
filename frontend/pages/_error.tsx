import { Error } from "components/Error"
import { GetServerSideProps } from "next"

const CustomError = (statusCode: number) => <Error statusCode={statusCode} />

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const statusCode = res ? res.statusCode : 404
  return { props: { statusCode } }
}

export default CustomError
