-- Compiled with roblox-ts v1.2.3
local TS = _G[script]
local Workspace = TS.import(script, TS.getModule(script, "@rbxts", "services")).Workspace
local cframeFarAway = CFrame.new(0, 10e8, 0)
local ObjectPool
do
	ObjectPool = setmetatable({}, {
		__tostring = function()
			return "ObjectPool"
		end,
	})
	ObjectPool.__index = ObjectPool
	function ObjectPool.new(...)
		local self = setmetatable({}, ObjectPool)
		return self:constructor(...) or self
	end
	function ObjectPool:constructor(templateOrObjectFactory, capacity, poolParent)
		if capacity == nil then
			capacity = 5
		end
		if poolParent == nil then
			poolParent = Workspace
		end
		self.poolParent = poolParent
		self.pool = {}
		self.inUse = {}
		self.expansionIncrement = 10
		self.objectFactory = typeof(templateOrObjectFactory) == "Instance" and function()
			return templateOrObjectFactory:Clone()
		end or templateOrObjectFactory
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < capacity) then
					break
				end
				local object = self.objectFactory()
				if object:IsA("BasePart") then
					object.CFrame = cframeFarAway
					object.Anchored = true
				elseif object:IsA("Model") then
					object:SetPrimaryPartCFrame(cframeFarAway)
					object.PrimaryPart.Anchored = true
				end
				object.Parent = poolParent
				local _pool = self.pool
				-- ▼ Array.push ▼
				_pool[#_pool + 1] = object
				-- ▲ Array.push ▲
			end
		end
	end
	function ObjectPool:get()
		if #self.pool == 0 then
			self:expand()
		end
		local _exp = self.pool
		-- ▼ Array.pop ▼
		local _length = #_exp
		local _result = _exp[_length]
		_exp[_length] = nil
		-- ▲ Array.pop ▲
		local object = _result
		local _inUse = self.inUse
		-- ▼ Array.push ▼
		_inUse[#_inUse + 1] = object
		-- ▲ Array.push ▲
		return object
	end
	function ObjectPool:release(object)
		if not (table.find(self.inUse, object) ~= nil) then
			return nil
		end
		local _inUse = self.inUse
		local _inUse_1 = self.inUse
		local _arg0 = function(v)
			return v == object
		end
		-- ▼ ReadonlyArray.findIndex ▼
		local _result = -1
		for _i, _v in ipairs(_inUse_1) do
			if _arg0(_v, _i - 1, _inUse_1) == true then
				_result = _i - 1
				break
			end
		end
		-- ▲ ReadonlyArray.findIndex ▲
		table.remove(_inUse, _result + 1)
		local _pool = self.pool
		-- ▼ Array.push ▼
		_pool[#_pool + 1] = object
		-- ▲ Array.push ▲
		if object:IsA("BasePart") then
			object.CFrame = cframeFarAway
			object.Anchored = true
		elseif object:IsA("Model") then
			object:SetPrimaryPartCFrame(cframeFarAway)
			object.PrimaryPart.Anchored = true
		end
		object.Parent = self.poolParent
	end
	function ObjectPool:expand(increment)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				local _exp = i
				local _condition = increment
				if _condition == nil then
					_condition = self.expansionIncrement
				end
				if not (_exp < _condition) then
					break
				end
				local object = self.objectFactory()
				if object:IsA("BasePart") then
					object.CFrame = cframeFarAway
					object.Anchored = true
				elseif object:IsA("Model") then
					object:SetPrimaryPartCFrame(cframeFarAway)
					object.PrimaryPart.Anchored = true
				end
				object.Parent = self.poolParent
				local _pool = self.pool
				-- ▼ Array.push ▼
				_pool[#_pool + 1] = object
				-- ▲ Array.push ▲
			end
		end
	end
	function ObjectPool:destroy(destroyInUse)
		if destroyInUse == nil then
			destroyInUse = false
		end
		local _pool = self.pool
		local _arg0 = function(v, i)
			table.remove(self.pool, i + 1)
			v:Destroy()
		end
		-- ▼ ReadonlyArray.forEach ▼
		for _k, _v in ipairs(_pool) do
			_arg0(_v, _k - 1, _pool)
		end
		-- ▲ ReadonlyArray.forEach ▲
		local _inUse = self.inUse
		local _arg0_1 = function(v, i)
			table.remove(self.pool, i + 1)
			if destroyInUse then
				v:Destroy()
			end
		end
		-- ▼ ReadonlyArray.forEach ▼
		for _k, _v in ipairs(_inUse) do
			_arg0_1(_v, _k - 1, _inUse)
		end
		-- ▲ ReadonlyArray.forEach ▲
		-- @ts-ignore
		self = nil
	end
end
return {
	ObjectPool = ObjectPool,
}
