import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
// import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { getFormErrorMessage } from '@igblsln/control';
import './styles.scss';
import { useRegisterMutation } from '@igblsln/store';
import { Link, useNavigate } from 'react-router-dom';

type Props = {}

const Register = (props: Props) => {
    const navigate = useNavigate()
    const [showMessage, setShowMessage] = useState(false);
    const [formData, setFormData] = useState({
        user_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        accept: false
    });
    const defaultValues = {
        user_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        accept: false
    }


    const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues });
    const [addRegister] = useRegisterMutation()

    const onSubmit = async (data: any) => {
        setFormData(data);
        await addRegister({ ...data }).unwrap();
        setShowMessage(true);
        reset();
    };

    const dialogFooter = <div className="flex justify-content-center"><Button label="OK" className="p-button-text" onClick={() => setShowMessage(false)} /></div>;

    return (
        <>
            <Dialog visible={showMessage} onHide={() => { navigate('/login'); setShowMessage(false); }} 
            onClick={() => { navigate('/login'); setShowMessage(false); }}
            position="top" footer={dialogFooter} showHeader={false} breakpoints={{ '960px': '80vw' }} style={{ width: '30vw' }}>
                <div className="flex justify-content-center flex-column pt-6 px-3">
                    <i className="pi pi-check-circle" style={{ fontSize: '5rem', color: 'var(--green-500)' }}></i>
                    <h5>Registration Successful!</h5>
                    <p style={{ lineHeight: 1.5, textIndent: '1rem' }}>
                        Your account is registered under name <b>{formData.user_name}</b> ;
                    </p>
                </div>
            </Dialog>
            <div className='ig-login min-h-screen'>
                <div className='register-form px-4 py-8 md:px-6 lg:px-8'>
                    <div className="flex align-items-center justify-content-center">
                        <div className="card p-4 shadow-2 border-round">
                            <div className="text-center mb-5">
                                <img src="hook128.png" alt="hyper" height="50" className="mb-3" />
                                <div className="text-900 text-3xl font-medium mb-3">Register</div>
                                <span className="text-600 font-medium line-height-3">Already have an account?</span>
                            <Link to="/login"
                                className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">
                                Sign in
                            </Link>
                            </div>
                            <div>
                                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
                                    <div className="field">
                                        <>
                                            <span className="p-float-label">
                                                <Controller name="user_name" control={control} rules={{ required: 'User Name is required.' }} render={({ field, fieldState }) => (
                                                    <InputText id={field.name} {...field} autoFocus className={classNames({ 'p-invalid': fieldState.invalid })} />
                                                )} />
                                                <label htmlFor="user_name" className={classNames({ 'p-error': errors.user_name })}>User Name*</label>
                                            </span>
                                            {getFormErrorMessage(errors?.user_name?.message)}
                                        </>
                                    </div>
                                    <div className="field">
                                        <>
                                            <span className="p-float-label">
                                                <Controller name="first_name" control={control} rules={{ required: 'First Name is required.' }} render={({ field, fieldState }) => (
                                                    <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                                )} />
                                                <label htmlFor="first_name" className={classNames({ 'p-error': errors.first_name })}>First Name*</label>
                                            </span>
                                            {getFormErrorMessage(errors?.first_name?.message)}
                                        </>
                                    </div>
                                    <div className="field">
                                        <>
                                            <span className="p-float-label">
                                                <Controller name="last_name" control={control} rules={{ required: 'Last Name is required.' }} render={({ field, fieldState }) => (
                                                    <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                                )} />
                                                <label htmlFor="last_name" className={classNames({ 'p-error': errors.last_name })}>Last Name*</label>
                                            </span>
                                            {getFormErrorMessage(errors?.last_name?.message)}
                                        </>
                                    </div>
                                    <div className="field">
                                        <>
                                            <span className="p-float-label p-input-icon-right">
                                                <i className="pi pi-envelope" />
                                                <Controller name="email" control={control}
                                                    rules={{ required: 'Email is required.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'Invalid email address. E.g. example@email.com' } }}
                                                    render={({ field, fieldState }) => (
                                                        <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                                    )} />
                                                <label htmlFor="email" className={classNames({ 'p-error': !!errors.email })}>Email*</label>
                                            </span>
                                            {getFormErrorMessage(errors?.email?.message)}
                                        </>
                                    </div>
                                    <div className="field">
                                        <>
                                            <span className="p-float-label">
                                                <Controller name="phone_number" control={control} rules={{ required: 'Password is required.' }} render={({ field, fieldState }) => (
                                                    <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })}
                                                        maxLength={10} keyfilter="int" />
                                                    // <InputMask id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} mask="9999999999"
                                                    //     placeholder="9999999999"  ></InputMask>
                                                )} />
                                                <label htmlFor="phone_number" className={classNames({ 'p-error': errors.phone_number })}>Phone Number*</label>
                                            </span>
                                            {getFormErrorMessage(errors?.phone_number?.message)}
                                        </>
                                    </div>
                                    <div className="field-checkbox">
                                        <Controller name="accept" control={control} rules={{ required: true }} render={({ field, fieldState }) => (
                                            <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                        )} />
                                        <label htmlFor="accept" className={classNames({ 'p-error': errors.accept })}>I agree to the terms and conditions*</label>
                                    </div>

                                    <Button type="submit" label="Submit" className="mt-2" />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register