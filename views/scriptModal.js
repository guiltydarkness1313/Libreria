
$(".delete").on("click",function () {
    //el id del producto
    var id=$(this).val();
    //se abre el modal de mrd
    console.log(id);
    $('#deleteButton').attr("href","/delete?id="+id);
    $('#deleteModal').modal();
});
