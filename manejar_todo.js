$('.check:button').click(function(){
    var checked = !$(this).data('checked');
    $('input:checkbox').prop('checked', checked);
    $(this).val(checked ? 'Dermarcar todo' : 'Marcar todo' )
    $(this).data('checked', checked);
});