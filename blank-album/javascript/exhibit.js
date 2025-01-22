function apiURL() {
    return "http://localhost:9000/"
}


function renderResults(data, limit, skip) {
    fetch(`${apiURL()}creative/get_cache_last_update`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: getAuthToken()
        }
      })
      .then((response) => {
      if (!response.ok)
          throw new Error(response.statusText);
      return response.json();
      })
      .then((cache) => {
        data.data.forEach((entry) => {
            entry.renderedCategory = renderCategory(entry.category);
            return entry;
        });
        var th_gallery = {"data": data.data, cache_last_update: cache.last_updated}
        var output = Mustache.render(template, th_gallery);
        htmx.find("#content").innerHTML = output;
        htmx.process(htmx.find("#content"));

        let isLast = Math.floor(data.total/limit) > Math.ceil(skip/limit) ? false : true;
        let trueIndex = Math.floor(skip/limit);
        var pagination_data = {lastPage: isLast, first: trueIndex, next: skip+limit, last: data.total-limit, previous: skip-limit, page: Math.floor(skip/limit) + 1, limit: limit, total_pages: Math.floor(data.total/limit)}
        var output = Mustache.render(paginationTemplate, pagination_data);
        htmx.find("#pagination").innerHTML = output;
        htmx.process(htmx.find("#pagination"))
    })
    .catch (error => htmx.find('#output').innerHTML = error )
}

function renderExhibit(limit=65, skip=0) {
    skip = skip >= 0 ? skip : 0;
    fetch(`${apiURL()}creative/exhibit/${limit}/${skip}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
        Authorization: getAuthToken()
      }
    })
    .then((response) => {
        if (!response.ok)
            throw new Error(response.statusText);
        return response.json();
     })
    .then((data) => {
        if (data.data && data.data.length >= 1) {
            renderResults(data, limit, skip);
        }
        else {
            let message = "No images linked to your discord id were found in ThumbHubBot's database. Have you linked to discord?"
            htmx.find("#output").innerHTML = message
        }
    })
    .catch (error => {
        htmx.find("#output").innerHTML = error
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
                Authorization: getAuthToken()
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
          Authorization: getAuthToken()
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
        Authorization: getAuthToken()
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
