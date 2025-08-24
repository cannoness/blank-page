var easyMDE = new EasyMDE({
    element:document.getElementById('contentMarkdown'),
    uploadImage:true,
    imageUploadEndpoint:"/{{.StreamID}}/upload-image",
    imagePathAbsolute:true,
});

easyMDE.codemirror.on("blur", function() {
    saveDraft(false);
});
