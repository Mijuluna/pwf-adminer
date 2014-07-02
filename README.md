# pwf-models-adminer

Tool for simple model manipulation. Able to create lists with filters and pagination, editors and other detailed views used to manage database model data

## Requirements

List of base requirements. Remember that these libs require something as well.

* [pwf-locales](https://github.com/just-paja/pwf-locales)
* [pwf-models-schema](https://github.com/just-paja/pwf-models-schema)
* [pwf-form-models](https://github.com/just-paja/pwf-form-models)
* [pwf-input-file](https://github.com/just-paja/pwf-input-file)
* [pwf-input-collection](https://github.com/just-paja/pwf-input-collection)
 
## Install

```bash
bower install pwf-adminer
```

Adminer has a lot of dependencies, so it might look very ugly using static HTML. When using frameworks like [fudjan](https://github.com/just-paja/fudjan) or [django](https://github.com/just-paja/django-rape) can simplify the inclusion a lot. Remember, that good guys concatenate and minify their javascripts.

So here use from fudjan template. Fudjan includes all files defined librarys' package.json.
```html
<!DOCTYPE html>
<html>
  <head>
    <?
      $ren->content_for('scripts', 'bower/jquery/dist/jquery.js');
      $ren->content_for('scripts', 'bower/moment/moment.js');
      $ren->content_for('scripts', 'bower/async/lib/async.js');

      $ren->content_for('scripts', 'bower/pwf.js');
      $ren->content_for('scripts', 'bower/pwf-jquery-compat');
      $ren->content_for('scripts', 'bower/pwf-moment-compat');
      $ren->content_for('scripts', 'bower/pwf-async-compat');
      
      $ren->content_for('scripts', 'bower/pwf-config');
      $ren->content_for('scripts', 'bower/pwf-queue');
      $ren->content_for('scripts', 'bower/pwf-locales');
      $ren->content_for('scripts', 'bower/pwf-comm');
      $ren->content_for('scripts', 'bower/pwf-comm-form');
      $ren->content_for('scripts', 'bower/pwf-form');
      $ren->content_for('scripts', 'bower/pwf-form-models');
      $ren->content_for('scripts', 'bower/pwf-models');
      $ren->content_for('scripts', 'bower/pwf-models-schema');
      
      $ren->content_for('scripts', 'bower/pwf-input-file');
      $ren->content_for('scripts', 'bower/pwf-input-autocompleter');
      $ren->content_for('scripts', 'bower/pwf-input-collection');
  </head>
</html>
```

## Usage

Adminer is separated into 5 objects that handle operations. Adminer, List, Obvious, Editor, Destroyer

### Adminer
This is only a wrapper for remaining four objects. It renders them inside of itself with nice menu.

#### adminer#clear()
Clears adminers' content

#### adminer#list(next)
Clears content and load list of objects. Calls next in context of new list when finished.

#### adminer#create(data, next)
Clears content and shows editor for new object with ```data```. Calls ```next``` in context of new editor when finished.

#### adminer#edit(obj, next)
Clears content and shows editor for passed object ```obj```. Calls ```next``` in context of new editor when loaded and rendered.

```obj``` accepts integer as well as model instance

#### adminer#drop(obj, next)
Clears content and shows new destroyer object for ```obj```. Calls ```next``` in context of new destroyer when preloaded and rendered.

### List

### Obvious

### Editor

### Destroyer
