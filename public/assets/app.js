$(document).on("click", ".delete-comment", function () {
  var thisId = $(this).attr("data-value");

  $.ajax({
    method: "POST",
    url: "/remove/comment/" + thisId
  }).done(function (data) {
    window.location = window.location.pathname;
  });
});
