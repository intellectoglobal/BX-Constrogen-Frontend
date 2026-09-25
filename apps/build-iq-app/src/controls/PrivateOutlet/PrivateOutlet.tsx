import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@igblsln/store';
import Layout from '../../layout';

type Props = {}

const PrivateOutlet = (props: Props) => {
    const auth = useAuth()
    const location = useLocation()

    return auth.user ? (
        <Layout />
    ) : (
        <Navigate to="/login" state={{ from: location }} />
    )
}

export default PrivateOutlet