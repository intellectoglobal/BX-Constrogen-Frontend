import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectClientId, selectCompanyId, selectCompanyName } from '../app/auth/authSlice'

export const getClientProps = () => {
    const client = useSelector(selectClientId)
    const companyId = useSelector(selectCompanyId)
    const companyName = useSelector(selectCompanyName)

    return useMemo(() => ({
        client_id: parseInt(client),
        company_name: companyName,
        company: parseInt(companyId),
        company_id: parseInt(companyId),
    }), [client, companyId, companyName])
}

