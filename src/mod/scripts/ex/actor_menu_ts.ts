const last_mode: number = 0;
const xr_meet_dialog_closed: boolean = false;
const xr_meet_upgrade_closed: boolean = false;
const dead_body_searching: boolean = false;
const xr_meet_trade_closed: boolean = false;

function inventory_wnd_opened(): void {
  printf("---:>Inventory closed");
}

function inventory_wnd_closed(): void {
  printf("---:>Inventory closed");
}

/**
function actor_menu_mode(mode)
  if(mode==0) then
  if(last_mode==1) then
  inventory_wnd_closed()
  elseif(last_mode==2) then
  trade_wnd_closed()
  elseif(last_mode==3) then
  upgrade_wnd_closed()
  elseif(last_mode==4) then
  dead_body_search_wnd_closed()
  end
  last_mode = 0
  elseif(mode==1) then
  last_mode = 1
  inventory_wnd_opened()
  elseif(mode==2) then
  last_mode = 2
  trade_wnd_opened()
  elseif(mode==3) then
  last_mode = 3
  upgrade_wnd_opened()
  elseif(mode==4) then
  last_mode = 4
  dead_body_search_wnd_opened()
  elseif(mode==10) then
  dialog_wnd_showed()
  elseif(mode==11) then
  dialog_wnd_closed()
end
end

function trade_wnd_opened()
xr_meet_dialog_closed = false
printf("---:>Trade opened")
end

function trade_wnd_closed()
printf("---:>Trade closed")
xr_meet_trade_closed = true
end

function upgrade_wnd_opened()
xr_meet_dialog_closed = false
printf("---:>Upgrade opened")
end

function upgrade_wnd_closed()
printf("---:>Upgrade closed")
xr_meet_upgrade_closed = true
end

function dead_body_search_wnd_opened()
printf("---:>DeadBodySearch opened")
dead_body_searching = true
end

function dead_body_search_wnd_closed()
printf("---:>DeadBodySearch closed")
dead_body_searching = false
end

function dialog_wnd_showed()
printf("---:>Talk Dialog show")
end

function dialog_wnd_closed()
printf("---:>Talk Dialog hide")
xr_meet_dialog_closed = true
end

*/
