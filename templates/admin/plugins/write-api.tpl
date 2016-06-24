<div class="row">
	<div class="col-lg-5">
		<div class="panel panel-default">
			<div class="panel-heading">Write API Settings</div>
			<div class="panel-body">
				<form role="form" class="writeapi-settings">
					<div class="checkbox">
						<label>
							<input type="checkbox" name="requireHttps"> Require API usage via HTTPS only
						</label>
					</div>
					<hr />
					<div class="checkbox">
						<label>
							<input type="checkbox" name="jwt:enabled"> Enable authentication via <a href="http://jwt.io">JSON Web Tokens</a>
						</label>
					</div>
					<div class="form-group">
						<label for="jwt:secret">JSON Web Token Secret</label>
						<input type="text" class="form-control" name="jwt:secret" id="jwt:secret" />
					</div>
					<div class="form-group">
						<label for="jwt:payloadKey">JSON Web Token Payload Key</label>
						<input type="text" class="form-control" name="jwt:payloadKey" id="jwt:payloadKey" placeholder="Default: token" />
					</div>
					<p class="help-block">
						JSON Web Tokens are an open, industry standard RFC 7519 method for representing claims securely between two parties.
						To make requests with a JSON Web Token instead of a user/master token, sign the entire request payload with the same
						secret as defined in the plugin, and either send it in the <code>POST</code> body, or as a query string parameter. In both cases,
						the key `token` is used.
					</p>
				</form>
				<button type="button" class="pull-right btn btn-primary" id="save">Save</button>
			</div>
		</div>

		<div class="panel panel-default">
			<div class="panel-heading">Active Tokens</div>
			<div class="panel-body">
				<table class="table table-striped user-tokens">
					<tr>
						<th>User/Token</th>
					</tr>
					<!-- BEGIN tokens -->
					<tr data-token="{tokens.access_token}" data-token-type="user">
						<td>
							<div class="input-group">
								<span class="input-group-addon">
									<!-- IF tokens.user.picture -->
									<img class="avatar avatar-sm avatar-rounded" src="{tokens.user.picture}" title="{tokens.user.username} (uid {tokens.uid})">
									<!-- ELSE -->
									<div class="avatar avatar-sm avatar-rounded" style="background-color: {tokens.user.icon:bgColor};">{tokens.user.icon:text}</div>
									<!-- ENDIF tokens.user.picture -->
								</span>
								<input type="text" class="form-control" value="{tokens.access_token}" readonly />
								<span class="input-group-btn">
									<button class="btn btn-default" data-action="revoke" type="button"><i class="fa fa-times"></i> Revoke</button>
								</span>
							</div>
						</td>
					</tr>
					<!-- END tokens -->
				</table>
				<form role="form" class="row">
					<div class="form-group col-xs-6">
						<input type="text" class="form-control" id="newToken-uid" placeholder="uid" />
					</div>
					<div class="form-group col-xs-6">
						<button type="button" class="btn btn-block btn-primary" id="newToken-create">Create Token</button>
					</div>
				</form>
			</div>
		</div>

		<div class="panel panel-default">
			<div class="panel-heading">Master Tokens</div>
			<div class="panel-body">
				<table class="table table-striped">
					<tr>
						<th>Token</th>
					</tr>
					<!-- BEGIN masterTokens -->
					<tr data-token="{masterTokens.access_token}" data-token-type="master">
						<td>
							 <div class="input-group">
								<input type="text" class="form-control" value="{masterTokens.access_token}" readonly />
								<span class="input-group-btn">
									<button class="btn btn-default" data-action="revoke" type="button"><i class="fa fa-times"></i> Revoke</button>
								</span>
							</div>
						</td>
					</tr>
					<!-- END masterTokens -->
				</table>
				<form role="form">
					<div class="form-group">
						<button type="button" class="btn btn-block btn-primary" id="masterToken-create">Create Token</button>
						<p class="help-block">
							Master tokens differ from regular write-enabled tokens in that they can be utilised to make any API call as any user.
						</p>
						<p class="help-block">
							To define a user in your call, add the <code>_uid</code> parameter to your request body.
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
	<div class="col-lg-7">
		<div class="row">
			<div class="col-xs-12">
				<div class="panel panel-default">
					<div class="panel-heading">API Documentation</div>
					<div class="panel-body">
						{documentation}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>