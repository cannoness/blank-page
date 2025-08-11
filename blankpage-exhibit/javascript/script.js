var navTemplate;
var tabTemplate;

function register() {
    Swal.fire({
        title: 'Registration',
        html: `
            <form class="px-sm-5">  
                <div class="form-row py-md-3">
                    <label for="username">Username</label>
                    <input type="text" id="username" class="form-control form-control-md" placeholder="Username">
                </div>
                <div class="form-row py-md-3">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" class="form-control form-control-md" placeholder="email@example.com">
                </div>
                <div class="form-row py-md-3">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-control form-control-md" placeholder="Password">
                </div>

                <!-- HONEYPOT -->
                <div class="form-row py-md-3 nocation" aria-hidden="true">
                    <label class="nocation" for="location">Location</label>
                    <input type="text" id="location" class="form-control form-control-md nocation" placeholder="Location">
                </div>
            </form>
        `,
        confirmButtonText: 'Register',
        focusConfirm: false,
        showCancelButton: true,
        customClass: {
            actions: 'my-actions',
            cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
            confirmButton: 'order-2 btn btn-primary btn-lg bg-primary mx-sm-3'
        },
        didOpen: () => {
          const popup = Swal.getPopup()
          usernameInput = popup.querySelector('#username') 
          passwordInput = popup.querySelector('#password')
          emailInput = popup.querySelector('#email')
          usernameInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
          passwordInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
          emailInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
        },
        preConfirm: () => {
          const username = usernameInput.value
          const password = passwordInput.value
          const email = emailInput.value
          if (!username || !password || !email) {
            Swal.showValidationMessage(`Please enter username, email, and password`)
          }
          return { username, password, email }
        },
      }).then((result) => {
        if (result.isConfirmed) {
            const data = {
                username: result.value.username,
                email: result.value.email,
                password: result.value.password
            };
            fetch(`${apiURL()}auth/register`, {
                method: "POST",
                body: JSON.stringify(data),
                headers:{
                    accept: "application/json",
                    "content-type": "application/json"
                }
              })
              .then((response) =>  {
                   if (!response.ok)
                      throw new Error(response.statusText);
                   return response.json();
               })
               .then((resp)=> {
                    console.log(resp)
                    Swal.fire({
                        title: 'Registration Success',
                        confirmButtonText: 'ok',
                        focusConfirm: true,
                        customClass: {
                            actions: 'my-actions',
                            cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
                            confirmButton: 'order-2 btn btn-primary btn-lg bg-primary mx-sm-3'
                        }
                    })
                    .catch (error =>
                        htmx.find('#output').innerHTML = JSON.stringify(error)
                    );                
              })
              .catch (error =>
                  htmx.find('#output').innerHTML = JSON.stringify(error)
              );
        }

      })     
}

function profile() {
    const token = sessionStorage["authToken"].slice(7,);
    document.cookie += `; token`
    window.location.href=`http://localhost:8080/.sso?token=${token}`
}

 function login() {
    Swal.fire({
        title: 'Log In',
        html: `
            <form class="px-sm-5">  
                <div class="form-row py-md-3">
                    <label for="username">Username</label>
                    <input type="text" id="username" class="form-control form-control-md" placeholder="Username">
                </div>
                <div class="form-row py-md-3">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-control form-control-md" placeholder="Password">
                </div>
            </form>
        `,
        confirmButtonText: 'Sign in',
        focusConfirm: false,
        showCancelButton: true,
        customClass: {
            actions: 'my-actions',
            cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
            confirmButton: 'order-2 btn btn-primary btn-lg bg-primary mx-sm-3'
        },
        didOpen: () => {
          const popup = Swal.getPopup()
          usernameInput = popup.querySelector('#username') 
          passwordInput = popup.querySelector('#password')
          usernameInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
          passwordInput.onkeyup = (event) => event.key === 'Enter' && Swal.clickConfirm()
        },
        preConfirm: () => {
          const username = usernameInput.value
          const password = passwordInput.value
          if (!username || !password) {
            Swal.showValidationMessage(`Please enter username and password`)
          }
          return { username, password }
        },
      }).then((result) => {
        if (result.isConfirmed) {
            const data = new URLSearchParams();
            data.append("username", result.value.username);
            data.append("password", result.value.password);
            fetch(`${apiURL()}auth/token`, {
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    accept: "application/json"
                }
            })
            .then((response) =>  {
                if (!response.ok)
                    throw new Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                if (!data.access_token) return false;
                sessionStorage.setItem('authToken', `Bearer ${data.access_token}`);
                renderNavLinks();
                
                
                Swal.fire({
                    title: 'Login Success',
                    confirmButtonText: 'ok',
                    focusConfirm: true,
                    customClass: {
                        actions: 'my-actions',
                        cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
                        confirmButton: 'order-2 btn btn-primary btn-lg bg-primary mx-sm-3'
                    }
                });
            })
            .catch (error =>
                htmx.find('#output').innerHTML = JSON.stringify(error)
            );
        }
      })    
}


function confirmLogout() {
  Swal.fire({
      title: 'WARNING',
      text:'Are your sure you want to log out?',
      showCancelButton: true,
      confirmButtonText: 'Log Out',
      customClass: {
          actions: 'my-actions',
          cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
          confirmButton: 'order-2 btn btn-danger btn-lg bg-danger mx-sm-3'
      },
  })
  .then((result) => {
      if(result.isConfirmed) {
        sessionStorage.clear();
        renderNavLinks();
        Swal.fire({
            title: 'Logout Success',
            confirmButtonText: 'ok',
            focusConfirm: true,
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 btn btn-gray btn-lg bg-default mx-sm-3',
                confirmButton: 'order-2 btn btn-primary btn-lg bg-primary mx-sm-3'
            }
        })
      }
    })
  }

function linkDiscord() {
   fetch(`${apiURL()}auth/authorize_discord`, {
      method: "GET",
      headers: {
         accept: "application/json"
      }
    })
    .then((response) =>  {
         if (!response.ok)
            throw new Error(response.statusText);
     })
    .catch (error =>
        htmx.find('#output').innerHTML = JSON.stringify(error)
    );
}

function linkTumblr() {
  htmx.ajax( "GET", `${apiURL()}auth/authorize_tumblr`)
  .then((response) =>  {
       if (!response.ok)
          throw new Error(response.statusText);
   })
  .catch (error =>
      htmx.find('#output').innerHTML = JSON.stringify(error)
  );
}
