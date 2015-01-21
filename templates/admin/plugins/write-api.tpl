<div class="row">
	<div class="col-lg-9">
		<div class="row">
			<div class="col-sm-6">
				<div class="panel panel-default">
					<div class="panel-heading">Active Tokens</div>
					<div class="panel-body">
						<table class="table table-striped">
							<tr>
								<th>User</th>
								<th>Token</th>
							</tr>
							<!-- BEGIN tokens -->
							<tr data-token="{tokens.access_token}" data-token-type="user">
								<td>
									<img class="img-circle write-api img-small" src="{tokens.user.picture}" title="{tokens.user.username} (uid {tokens.uid})">
								</td>
								<td>
									 {tokens.access_token} <span class="label label-warning pointer" data-action="revoke">Revoke</span>
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
			</div>

			<div class="col-sm-6">
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
									 {masterTokens.access_token} <span class="label label-warning pointer" data-action="revoke">Revoke</span>
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
		</div>
		<div class="panel panel-default">
			<div class="panel-heading">Write API Settings</div>
			<div class="panel-body">
				<form role="form" class="writeapi-settings">
					<!-- <p>
						Adjust these settings. You can then retrieve these settings in code via:
						<code>meta.config['sample:setting1']</code> and <code>meta.config['sample:setting2']</code>
					</p>
					<div class="form-group">
						<label for="Setting 1">Setting 1</label>
						<input type="text" id="setting-1" name="setting-1" title="Setting 1" class="form-control" placeholder="Setting 1"><br />
					</div>
					<div class="form-group">
						<label for="Setting 2">Setting 2</label>
						<input type="text" id="setting-2" name="setting-2" title="Setting 2" class="form-control" placeholder="Setting 2">
					</div> -->
				</form>
			</div>
		</div>
	</div>
	<div class="col-lg-3">
		<div class="panel panel-default">
			<div class="panel-heading">Control Panel</div>
			<div class="panel-body">
				<button class="btn btn-primary" id="save" disabled>Save Settings</button>
			</div>
		</div>
	</div>
</div>