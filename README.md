# vscode-aura-route-jump

[vscode-aura-route-jump - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=YukiAdachi.vscode-aura-route-jump)

## Features

- Go to BEAR.Resource file from aura.route.php

## e.g.

- `@Named("getFoo=getFOO,getBar=getBAR")` => jump to `var/db/sql/getBAR.sql`
- `@Query(id="getHoge"` => jump to `var/db/sql/getHoge.sql`
- `@Query("getPiyo", type="row")` => jump to `var/db/sql/getPiyo.sql`
- `#[DbQuery(id:'foo_bar_list')]` => jump to `var/db/sql/foo_bar_list.sql`
- `#[DbQuery('get_hoge_piyo')]` => jump to `var/db/sql/get_hoge_piyo.sql`
