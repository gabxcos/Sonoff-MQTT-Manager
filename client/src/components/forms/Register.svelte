<script>
    import { Toast, ToastBody, ToastHeader } from 'sveltestrap';
    import { isAuth } from '../../auth';
    import { onMount } from 'svelte';

    onMount(()=>{
        if($isAuth) location = "/";
    })

    let nickname, username, password;
    let host = SERVER_HOST, port = SERVER_PORT;

    let success = false;
    let error = false;
    let message;

    const successToggle = () => ( success != success );
    const errorToggle = () => ( error != error );

    const submit = async () => {
        await fetch(`http://${host}:${port}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: nickname,
                username: username,
                password: password
            })
        })
        .then(res => {
            if(res.ok) return res.json();         

            throw new Error('Something went wrong.');
        })
        .then(data => {
            if(data.success) success = true;
            message = data.message;
            console.log(data);
        })
        .catch(err => {
            error = true;
            message = "An error occurred";
            console.log(err);
        });
    };
</script>

<form class="form-signin" on:submit|preventDefault={submit}>
    <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
    <label for="inputNickname" class="sr-only">Display name</label>
    <input type="text" id="inputNickname" class="form-control" bind:value={nickname} placeholder="Nickname" required="true">
    <label for="inputUsername" class="sr-only">Username</label>
    <input type="text" id="inputUsername" class="form-control" bind:value={username} placeholder="Username" required="true">
    <label for="inputPassword" class="sr-only">Password</label>
    <input type="password" id="inputPassword" class="form-control" bind:value={password} placeholder="Password" required="true">
    <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
</form>

{#if success}
    <div class="toastSuccess">
        <Toast
            autohide
            {success}
            on:close={ successToggle }
        >
            <ToastHeader { successToggle } icon="success">Registration successful!</ToastHeader>
            <ToastBody>
                {message}
            </ToastBody>
        </Toast>
    </div>
{/if}

{#if error}
    <div class="toastError">
        <Toast
            autohide
            {error}
            on:close={ errorToggle }
        >
            <ToastHeader { errorToggle } icon="danger">Something went wrong!</ToastHeader>
            <ToastBody>
                {message}
            </ToastBody>
        </Toast>
    </div>
{/if}

<style>
    /* FORM */
    .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: 0 auto;
    }
    .form-signin .form-control {
    position: relative;
    box-sizing: border-box;
    height: auto;
    padding: 10px;
    font-size: 16px;
    }
    .form-signin .form-control:focus {
    z-index: 2;
    }
    .form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    }

    /* TOAST */
    .toastSuccess, .toastError {
        position: fixed;
        bottom: 40px;
        right: 40px;
    }
</style>