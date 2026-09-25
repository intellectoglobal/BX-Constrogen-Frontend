import React, { useEffect } from 'react'
import { useDispatch } from "react-redux";
import { setPromptNavigate } from '@igblsln/store';

type Props = {
    isDirty: boolean
}

const DirtyOnConfirm = ({ isDirty }: Props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPromptNavigate({ promptNavigate: isDirty}))
    }, [isDirty])

    return (
        <></>
    )
}

export default DirtyOnConfirm