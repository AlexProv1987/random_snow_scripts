var CMHRemoteSyncConstants = Class.create();

/**FIELDS PER TABLE**/
CMHRemoteSyncConstants.SYS_USER_FIELDS = ''; //tbd by king willie

CMHRemoteSyncConstants.SYS_USER_HAS_ROLE_FIELDS = 'user,role,state,included_in_role,included_in_role_instance,inh_count,inh_map,inherited,role,state';

CMHRemoteSyncConstants.SYS_USER_GROUP_FIELDS = 'name,manager,u_director,u_sr_director,u_vp,email,parent,active,u_group_type,type,description';

CMHRemoteSyncConstants.SYS_GROUP_HAS_ROLE_FIELDS = 'group,inherits,role,';

/**SYS_AUTH_BASIC SYS_ID**/
CMHRemoteSyncConstants.CREDENTIAL_ID_BASIC = '2e3e80759729be145bcdb680f053afa8';

//use by CMHRemoteSyncConstants.VAR