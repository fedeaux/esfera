class @StructuredMenu
  constructor: () ->
    $('#menu').html JSV.menu.main @get_menu_structure()

  get_menu_structure: () ->
    [
      'Biologia'
      'Física'
      'Matemática'
      'Português'
      'Química'
    ]
