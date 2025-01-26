function apiURL() {
    return "http://localhost:9091/"
}

function renderResults(data, limit, skip) {

        htmx.find("#content").innerHTML = data.exhibit;
        htmx.process(htmx.find("#content"));


        htmx.find("#pagination").innerHTML = data.pagination;
        htmx.process(htmx.find("#pagination"));
}

function renderExhibit(limit=65, skip=0) {
    skip = skip >= 0 ? skip : 0;
    fetch(`${apiURL()}creative/exhibit/${limit}/${skip}`, {
      method: "GET",
      headers: {
         accept: "application/json",
         mode: "no-cors",
         Authorization: `Bearer ${document.cookie.split("=")[1]}`
      }
    })
    .then((response) => {
        if (!response.ok)
            throw new Error(response.statusText);
        return response.json();
     })
    .then((data) => {
        if (data) {
            renderResults(data, limit, skip);
        }
        else {
            let message = "No images linked to your discord id were found in ThumbHubBot's database. Have you linked to discord?"
            htmx.find("#output").innerHTML = message;
        }
    })
    .catch (error => {
        htmx.find("#output").innerHTML = error;
    })
}

function renderCategory(category) {
    return "Uncategorized";
}

function confirmRemoval(link_id) {
    Swal.fire({
        title: 'WARNING',
        text:'This will remove this image from your link library in ThumbHubBot, are you sure you want to continue?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Delete it!',
        denyButtonText: 'Go back',
        customClass: {
            actions: 'my-actions',
            cancelButton: 'order-1 right-gap',
            confirmButton: 'order-2',
            denyButton: 'order-3',
        },
    })
    .then((result) => {
        if(result.isConfirmed){
           const removal = {
                link_id: link_id
            }
          fetch(`${apiURL()}creative/remove_link`, {
              method: "POST",
              body: JSON.stringify(removal),
              headers: {
                "Content-Type": "application/json",
                accept: "application/json",

                 mode: "no-cors",
                 Authorization: `Bearer ${document.cookie.split("=")[1]}`
              }
            })
            .then((response) => {
            if (!response.ok)
                throw new Error(response.statusText);
             return response.json();
             })
            .then(() => {
                renderExhibit();
            })
            .catch (error => htmx.find('#output').innerHTML = error )
        }
    })
}


function clearCache() {
    fetch(`${apiURL()}creative/refresh_cache`, {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",

         mode: "no-cors",
         Authorization: `Bearer ${document.cookie.split("=")[1]}`
        }
      })
      .then((response) => {
          if (!response.ok)
              throw new Error(response.statusText);
          return response.json();
       })
       .catch (error => htmx.find('#output').innerHTML = error )
}

function keywordSearch(skip=0, limit=66) {
    if (!template)
        template = htmx.find("#exhibit-template").innerHTML;
    if (!exhibitPaginationTemplate)
        paginationTemplate = htmx.find("#exhibit-pagination-template").innerHTML;
    if (!discordTemplate)
        discordTemplate = htmx.find("#discordTemplate").innerHTML;
    skip = skip >= 0 ? skip : 0;
    keywords = htmx.find("#keywords").value
    const c_keys = {
        keywords: keywords
    }
    fetch(`${apiURL()}creative/exhibit/${limit}/${skip}`, {
      method: "POST",
      body: JSON.stringify(c_keys),
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",

         mode: "no-cors",
         Authorization: `Bearer ${document.cookie.split("=")[1]}`
      }
    })
  .then((response) => {
      if (!response.ok)
          throw new Error(response.statusText);
      return response.json();
   })
   .then((data) => {
        if (data.data.length >= 1) {
            renderResults(data, limit, skip);
        }
        else {
            let message = "No images found!";
            htmx.find("#output").innerHTML = message;
            renderExhibit();
        }
   })
   .catch (error => htmx.find('#output').innerHTML = error )
}

renderExhibit();