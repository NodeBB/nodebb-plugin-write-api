<h1><i class="fa fa-cogs"></i> Write API for NodeBB</h1>

<div class="row">
	<div class="col-lg-8 col-sm-6 col-xs-12">
		<h2>Eventually, some options will go here</h2>
	</div>
	<div class="col-lg-4 col-sm-6 col-xs-12">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h3 class="panel-title">Active Tokens</h3>
			</div>
			<div class="panel-body">
				<table class="table table-striped">
					<!-- BEGIN tokens -->
					<tr>
						<td>
							<img class="img-circle write-api img-small" src="{tokens.user.picture}" title="{tokens.user.username}"> {tokens.access_token} (assigned to uid {tokens.uid})
						</td>
					</tr>
					<!-- END tokens -->
				</table>
				<form role="form" class="form-inline">
					<label for="newToken-uid">For uid</label>
					<input type="text" class="form-control" id="newToken-uid" placeholder="uid" /><br />
					<button type="button" class="btn btn-block btn-primary" id="newToken-create">Create Token</button>
				</form>
			</div>
		</div>
	</div>
</div>